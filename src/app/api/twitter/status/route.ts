import { credentialCollection, db, twitterEnum } from "@/models/name";
import { databases } from "@/models/server/config";
import redisClient from "@/redis/redis";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

export async function GET(req: NextRequest){
  const cookieStore = await cookies()

  const userId = cookieStore.get('userId')?.value

  if (!userId) return NextResponse.json({error: 'user not loggedIn'}, {status: 400})

  const userByRedis = await redisClient.get(`user:twitter:${userId}`)

  if(userByRedis)
    return NextResponse.json({message: 'redis:success retreiving user twitter info', data: JSON.parse(userByRedis)}, {status: 200})


  const existingDoc = await databases.listDocuments(db, credentialCollection, [
    Query.equal('platform', twitterEnum),
    Query.equal('userId', userId)
  ])

  if(existingDoc.total <= 0) return NextResponse.json({error: 'No Tokens'}, {status: 400})

  const tokenRes = await refreshTwitterToken(existingDoc.documents[0].refreshToken)

  const tokenData = await tokenRes.json()
  if(!tokenRes.ok)
    return NextResponse.json({error: tokenData.error || 'Token invalid or expired'}, {status: tokenRes.status})

  if(!tokenData.access_token || !tokenData.refresh_token)
    return NextResponse.json({error: 'Invalid token response from twitter'}, {status: 500})


  await databases.updateDocument(db, credentialCollection, existingDoc.documents[0]?.$id, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
  })

  const twitterUserRes = await fetchTwitterUser(tokenData.access_token)

  if(!twitterUserRes.ok)
    return NextResponse.json({error: 'Unable to get User'}, {status: twitterUserRes.status})

  const {data:twitterUser} = await twitterUserRes.json()

  try {
    const expiry = tokenData.expires_in > 120 ? tokenData.expires_in - 120 : tokenData.expires_in
    await redisClient.set(`user:twitter:${userId}`, JSON.stringify(twitterUser), { EX: expiry });

  } catch (err) {
    console.error('Redis Set Error:', err);

  }

  return NextResponse.json({message: 'Success retreiving user twitter info', data: twitterUser}, {status: 200})

}

async function fetchTwitterUser(access_token:string){
  return await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    }
  })
}

async function refreshTwitterToken(refresh_token: string){
  return await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
        "Content-type": "application/x-www-form-urlencoded",
        Authorization:
            "Basic " +
            Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64"),
    },
    body: new URLSearchParams({
        refresh_token,
        grant_type: "refresh_token",
        client_id: process.env.TWITTER_CLIENT_ID!,
        scope: "tweet.read users.read offline.access"
    })
  })
}
