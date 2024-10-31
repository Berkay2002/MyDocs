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
        src="/logo-2-docs.ico" // Update the path to your logo
        alt="App Logo"
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
        className="mt-4 w-64"
      >
        Sign in with Google
      </Button>
      {loginError && (
        <p className="text-red-500 text-sm mt-4">{loginError}</p>
      )}
    </div>
  );
};

export default Login;