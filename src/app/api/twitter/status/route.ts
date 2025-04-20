import { credentialCollection, db, twitterEnum } from "@/models/name";
import { databases } from "@/models/server/config";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";

export async function GET(req: NextRequest){
    const cookieStore = cookies()

    const userId = (await cookieStore).get('userId')?.value


    if (!userId) return NextResponse.json({error: 'user not loggedIn'}, {status: 400})

    const existingDoc = await databases.listDocuments(db, credentialCollection, [
        Query.equal('platform', twitterEnum),
        Query.equal('userId', userId)
    ])

    if(existingDoc.total <= 0) return NextResponse.json({error: 'No tokens'}, {status: 400})



    const res = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
      headers: {
        Authorization: `Bearer ${existingDoc.documents[0].accessToken}`,
      }
    })

    if (res.status === 429) {
        const resetTime = res.headers.get("x-rate-limit-reset");
        const limit = res.headers.get("x-rate-limit-limit")
        const limitRemaining = res.headers.get("x-rate-limit-remaining")
        return NextResponse.json(
          {
            error: "Rate limit exceeded",
            retryAfter: resetTime ? new Date(parseInt(resetTime) * 1000).toISOString() : null,
            limit,
            limitRemaining
          },
          { status: 429 }
        );
    }


    if(!res.ok) return NextResponse.json({error: 'Unable to get user data using access token'}, {status: res.status})

    const {data} = await res.json()


    return NextResponse.json({message: 'success retreiving user twitter info', data}, {status: res.status})


}
