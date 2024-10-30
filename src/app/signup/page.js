// /src/app/signup/page.js
"use client"
import SignUp from "@/components/Signup"

const SignUpPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl">Sign Up</h1>
      <SignUp />
    </div>
  )
}

export default SignUpPage