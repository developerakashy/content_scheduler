"use client"

import { useAuthStore } from "@/store/Auth"
import { useRouter } from "next/navigation"
import React, { useEffect } from "react"
import { Particles } from "@/components/magicui/particles"

const Layout = ({children}: {children:React.ReactNode}) => {
    const {session, hydrated} = useAuthStore()
    const router = useRouter()

    useEffect(() => {
        if (session && hydrated){
            router.push('/')
        }
    }, [session, router, hydrated])

    if(!hydrated || session){
        return null
    }


    return (
        <div className="h-screen bg-stone-50 flex items-center justify-center mx-2">
            {children}
            <Particles
                className="absolute inset-0 z-0"
                quantity={100}
                ease={80}
                color={'green'}
                refresh
            />
        </div>
    )
}

export default Layout
