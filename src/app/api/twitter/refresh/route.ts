import { credentialCollection, db, twitterEnum } from "@/models/name";
import { databases } from "@/models/server/config";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

export async function GET(req: NextRequest){
    const cookieStore = await cookies()

    const userId = cookieStore.get('userId')?.value

    if(!userId) return NextResponse.json({error: 'user not loggedIn'}, {status: 400})

    const existingDoc = await databases.listDocuments(db, credentialCollection, [
        Query.equal('platform', twitterEnum),
        Query.equal('userId', userId)
    ])

    if(existingDoc.total <= 0) return NextResponse.json({error: 'No Tokens'}, {status: 400})

    const res = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
            "Content-type": "application/x-www-form-urlencoded",
            Authorization:
                "Basic " +
                Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64"),
        },
        body: new URLSearchParams({
            refresh_token: existingDoc.documents[0].refreshToken,
            grant_type: "refresh_token",
            client_id: process.env.TWITTER_CLIENT_ID!,
            scope: "tweet.read users.read offline.access"
        })
    })




    if(!res.ok) return NextResponse.json({error: 'Error creating token using refresh'}, {status: res.status})

    const data = await res.json()

    await databases.updateDocument(db, credentialCollection, existingDoc.documents[0]?.$id, {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
    })

    const response = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        }
    })

    console.log(response)
    if (response.status === 429) {
        const resetTime = response.headers.get("x-rate-limit-reset");
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            retryAfter: resetTime ? (resetTime) : null
          },
          { status: 429 }
        );
    }

    const {data:userInfo} = await response.json()

    return NextResponse.json({messsage: 'Success retrieving user data', data: userInfo}, {status: response.status})


}
