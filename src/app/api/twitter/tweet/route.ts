export async function POST(req: Request){
    const {access_token, text} = await req.json()

    const response = await fetch("https://api.twitter.com/2/tweets", {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-type": "application/json"
        },
        body: JSON.stringify({text})
    })

    const data = await response.json()

    return new Response(JSON.stringify(data))
}
