"use client"

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BorderBeam } from "@/components/magicui/border-beam";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/store/Auth";
import { IconBrandGithub, IconBrandGoogleFilled } from "@tabler/icons-react";
import toast from "react-hot-toast";
import { Ring } from 'ldrs/react'
import 'ldrs/react/Ring.css'



function LoginForm() {
  const  { login, googleLogin } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    const email = formData.get('email')
    const password = formData.get('password')

    if(!email || !password){
      setError(() => 'Please fill all fields')
      toast.error('All field are required')
      return
    }

    setIsLoading(true)
    setError('')

    const response = await login(email.toString(), password.toString())

    if(response.error){
      setError(() => response.error!.message)
    }

    setIsLoading(false)

  }

  return (
    <Card className="relative w-[350px] overflow-hidden z-1">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input name="email" id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative flex items-center">
                <Input
                  name="password"
                  id="password"
                  type={`${showPassword ? 'text' : 'password'}`}
                  placeholder="Enter your password"
                />
                { showPassword ?
                  <EyeOff
                    onClick={() => setShowPassword(false)}
                    className="cursor-pointer absolute right-2 stroke-gray-500"
                  />:
                  <Eye
                    onClick={() => setShowPassword(true)}
                    className="cursor-pointer absolute right-2 stroke-gray-500"
                  />
                }
              </div>
            </div>
          </div>
          <CardFooter className="flex justify-between px-0 pt-6">
            <Link href={'/register'}>
              <Button type="button" variant="outline" className="cursor-pointer">Register</Button>
            </Link>
            <Button type="submit" className={`cursor-pointer transition-all ${isLoading ? 'w-12' : 'w-16'} ease-in-out duration-300`}>
              {isLoading ?
                <Ring
                  size="20"
                  stroke="2"
                  bgOpacity="0"
                  speed="2"
                  color="white"
                /> :
                'Login'
              }
            </Button>
          </CardFooter>
        </form>
        <div className="w-full flex flex-col justify-center gap-2">
              <div className="w-full  flex items-center py-6 pb-4">
                <div className="w-full border"></div>
                <p className="mx-1">OR</p>
                <div className="w-full border"></div>
              </div>
              <Button onClick={googleLogin} variant="outline" className="cursor-pointer w-full">
                <IconBrandGoogleFilled
                />
                <span>
                  Continue with Google
                </span>
              </Button>

              <Button variant="outline" className="cursor-pointer w-full ">
                <IconBrandGithub
                />
                <span>
                  Continue with Github
                </span>
              </Button>
        </div>
      </CardContent>
      <BorderBeam
        duration={5}
        size={300}
        reverse
        className="from-blue-500 via-violet-500 to-green-500"
      />
    </Card>
  );
}


export default LoginForm
