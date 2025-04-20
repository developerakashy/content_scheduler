import { account, databases } from "@/models/server/config"
import { NextRequest, NextResponse } from "next/server"
import { ID } from "appwrite"
import { credentialCollection, db, twitterEnum } from "@/models/name"
import { cookies } from "next/headers"
import { Query } from "node-appwrite"

export async function GET(req:NextRequest){
    const {searchParams} = new URL(req.url)

    const code = searchParams.get('code')

    if(!code) return new NextResponse("no code", { status:400 })

    const cookieStore = cookies()
    const userId = (await cookieStore).get('userId')?.value

    try {
        const user = await account.get()
        console.log(user)
    } catch (error) {
        console.log(error)
    }

    if(!userId) return NextResponse.json({error: 'User not loggedIn'}, {status:400})

    const res = await fetch('https://api.twitter.com/2/oauth2/token', {
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

    const data = await res.json()

    if(!data.access_token){
        return new Response(JSON.stringify(data), { status:400 })
    }

    const userInfoRes = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        }
    })

    const {data:data1} = await userInfoRes.json()

    console.log("Twitter Access Token:", data.access_token);

    const existingDocument = await databases.listDocuments(db, credentialCollection,
        [Query.equal('userId', userId), Query.equal('platform', twitterEnum)]
    )

    if(existingDocument.total > 0){
        await databases.updateDocument(db, credentialCollection, existingDocument.documents[0]?.$id, {
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
        })

    }else{

        await databases.createDocument(db, credentialCollection, ID.unique(),{
            platform: twitterEnum,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            userId

        })
    }


    console.log('Twitter connected you can now post')
    return NextResponse.json({data, data1});

}
