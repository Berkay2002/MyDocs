// /src/app/login/page.js
"use client"
import Login from "@/components/Login"

const LoginPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl">Login</h1>
      <Login />
    </div>
  )
}

export default LoginPage