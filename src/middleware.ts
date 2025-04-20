import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import getOrCreateDB from './models/server/dbSetup'
import getOrCreateStorage from './models/server/storageSetup'

let dbInitialized = false
export async function middleware(request: NextRequest) {
    if (dbInitialized) return
    dbInitialized = true

    await Promise.all([
        getOrCreateDB(),
    ])

    return NextResponse.next()

}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
    ],
}
