import { NextRequest, NextResponse } from "next/server"

export async function GET(req:NextRequest){
    const {searchParams} = new URL(req.url)

    const code = searchParams.get('code')

    if(!code) return new NextResponse("no code", { status:400 })

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

    console.log("Twitter Access Token:", data.access_token);

    console.log('Twitter connected you can now post')
    return new Response("Twitter connected successfully!");

}
