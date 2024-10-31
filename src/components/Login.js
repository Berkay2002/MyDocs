// src/components/Login.js

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  auth,
  firestore,
  signInWithGoogle,
  setDoc,
  doc,
  getDoc,
} from "../../firebase";
import { Button, IconButton, Icon } from "@mui/material";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // Navigate to the home page
    } catch (error) {
      console.error("Error logging in:", error);
      setLoginError(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      const userDocRef = doc(firestore, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // If it's the user's first time logging in, save their username
        const username = user.displayName || user.email.split("@")[0];
        await setDoc(userDocRef, { username, email: user.email });
      }
      router.push("/"); // Navigate to the home page
    } catch (error) {
      console.error("Error with Google sign-in:", error);
      setLoginError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Image
        src="/MainLogo.svg" // Changed from "/logo-2-docs.ico"
        alt="Main Logo"
        height={300}
        width={550}
        objectFit="contain"
      />
      <form onSubmit={handleLogin} className="flex flex-col items-center mt-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="p-2 rounded-sm border mb-2 w-64"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="p-2 rounded-sm border mb-4 w-64"
        />
        {/* Replace Button component as per your UI library */}
        <Button
          color="green"
          buttonType="filled"
          size="lg"
          rounded={true}
          ripple="light"
          type="submit"
          className="w-64"
        >
          Login
        </Button>
      </form>
      <p className="mt-4">or</p>
      <Button
        color="blue"
        buttonType="filled"
        size="lg"
        rounded={true}
        ripple="light"
        onClick={handleGoogleLogin}
        className="mt-4 w-64 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
          <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20 s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
          <path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
          <path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
          <path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
        </svg>
        Sign in with Google
      </Button>
      {loginError && (
        <p className="text-red-500 text-sm mt-4">{loginError}</p>
      )}
    </div>
  );
};

export default Login;