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
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/Auth";

function RegisterForm() {
    const { login, createAccount } = useAuthStore()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)

        const firstName = formData.get('firstName')
        const lastName = formData.get('lastName')
        const email = formData.get('email')
        const password = formData.get('password')

        if(!firstName || !lastName || !email || !password){
            setError(() => 'Please fill all fields')
            return
        }

        setIsLoading(true)
        setError('')

        const response = await createAccount(
            `${firstName} ${lastName}`,
            email.toString(),
            password?.toString()
        )

        if(response.error){
            setError(() => response.error!.message)
        }else{
            const loginResponse = await login(email.toString(), password.toString())

            if(loginResponse.error){
                setError(() => loginResponse.error!.message)
            }
        }

        setIsLoading(() => false)
    }

  return (
    <Card className="relative w-[370px] overflow-hidden z-1">
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Enter your info to create your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid w-full items-center gap-4">
            <div className="flex gap-2">
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="firstName">First name</Label>
                    <Input name="firstName" id="firstName" type="text" placeholder="e.g. John" />
                </div>
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input name="lastName" id="lastname" type="text" placeholder="e.g. Doe" />
                </div>
            </div>
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
                    /> :
                    <Eye
                        onClick={() => setShowPassword(true)}
                        className="cursor-pointer absolute right-2 stroke-gray-500"
                    />
                }
              </div>
            </div>
          </div>
          <CardFooter className="flex justify-between px-0 pt-6">
              <Link href={'/login'}>
                  <Button disabled={isLoading} type="button" variant="outline" className="cursor-pointer">Login</Button>
              </Link>
              <Button disabled={isLoading} type="submit" className="cursor-pointer">Register</Button>
          </CardFooter>
        </form>
      </CardContent>
      <BorderBeam
        duration={4}
        size={300}
        reverse
        className="from-transparent via-red-500 to-transparent"
      />
    </Card>
  );
}


export default RegisterForm
