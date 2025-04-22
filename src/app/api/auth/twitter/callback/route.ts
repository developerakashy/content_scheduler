import { account, databases } from "@/models/server/config"
import { NextRequest, NextResponse } from "next/server"
import { ID } from "appwrite"
import { credentialCollection, db, twitterEnum } from "@/models/name"
import { cookies } from "next/headers"
import { Query } from "node-appwrite"
import redisClient from "@/redis/redis"
import { json } from "stream/consumers"

export async function GET(req:NextRequest){
    const {searchParams} = new URL(req.url)

    const code = searchParams.get('code')

    if(!code) return new NextResponse("no code", { status:400 })

    const cookieStore = cookies()
    const userId = (await cookieStore).get('userId')?.value


    if(!userId) return NextResponse.json({error: 'User not loggedIn'}, {status:400})

    const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
            "Content-type": "application/x-www-form-urlencoded",
            Authorization:
                "Basic " +
                Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64"),
        },
        body: new URLSearchParams({
            code,
            grant_type: "authorization_code",
            redirect_uri: process.env.TWITTER_REDIRECT_URI!,
            code_verifier: "challenge"
        })
    })

    const tokenData = await tokenRes.json()

    if(!tokenData.access_token || !tokenData.refresh_token){
        return new Response(JSON.stringify(tokenData), { status:400 })
    }

    const twitterUserRes = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        }
    })


    const {data:twitterUser} = await twitterUserRes.json()


    const existingDocument = await databases.listDocuments(db, credentialCollection,
        [Query.equal('userId', userId), Query.equal('platform', twitterEnum)]
    )

    if(existingDocument.total > 0){
        await databases.updateDocument(db, credentialCollection, existingDocument.documents[0]?.$id, {
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
        })

    }else{

        await databases.createDocument(db, credentialCollection, ID.unique(),{
            platform: twitterEnum,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            userId

        })
    }

    try {
      const expiry = tokenData.expires_in > 120 ? tokenData.expires_in - 120 : tokenData.expires_in
      await redisClient.set(`user:twitter:${userId}`, JSON.stringify(twitterUser), { EX: expiry });

    } catch (err) {
      console.error('Redis Set Error:', err);

    }

    console.log('Twitter connected you can now post')
    return NextResponse.json({tokenData, twitterUser});

}
