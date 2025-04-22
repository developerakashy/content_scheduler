import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(){
    const redirectUrl = new URL("https://twitter.com/i/oauth2/authorize")
    const cookieStore = cookies()

    redirectUrl.searchParams.set("response_type", "code")
    redirectUrl.searchParams.set("client_id", process.env.TWITTER_CLIENT_ID!)
    redirectUrl.searchParams.set("redirect_uri", process.env.TWITTER_REDIRECT_URI!)
    redirectUrl.searchParams.set("scope", "tweet.read tweet.write users.read offline.access")
    redirectUrl.searchParams.set("state", "random_state")
    redirectUrl.searchParams.set("code_challenge", "challenge")
    redirectUrl.searchParams.set("code_challenge_method", "plain")

    return NextResponse.redirect(redirectUrl.toString())
}
