// src/components/Signup.js

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore, setDoc, doc, signInWithGoogle } from "../../firebase";
import { Button } from "@mui/material";
import Link from "next/link";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupError, setSignupError] = useState(null);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setSignupError("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user to Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, { email: user.email });

      router.push("/"); // Navigate to the home page after signup
    } catch (error) {
      console.error("Error signing up:", error);
      setSignupError(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const user = await signInWithGoogle();
      const userDocRef = doc(firestore, "users", user.uid);
      await setDoc(userDocRef, { email: user.email });
      
      router.push("/"); // Navigate to the home page
    } catch (error) {
      console.error("Error with Google sign-in:", error);
      setSignupError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden">
      <div className="bg-white w-full max-w-sm p-8 rounded-lg shadow-lg">
        <Image
          src="/MainLogo.svg"
          alt="Main Logo"
          height={80}
          width={80}
          objectFit="contain"
          className="mx-auto mb-4"
        />
        <h2 className="text-gray-700 text-xl font-semibold text-center mb-6">SIGN UP</h2>

        {/* Form */}
        <form onSubmit={handleSignup} className="flex flex-col">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="p-3 rounded border mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="p-3 rounded border mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            className="p-3 rounded border mb-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <Button
            type="submit"
            className="w-full py-3 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 transition"
          >
            Sign Up
          </Button>
        </form>

        {/* Divider with OR */}
        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-3 text-gray-500 text-sm">OR</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        {/* Social Signup Button */}
        <Button
          onClick={handleGoogleSignup}
          className="w-full py-3 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg mb-4"
        >
            <div className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 48 48">
                <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                <path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                <path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                <path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
              </svg>
            </div>
          Sign up with Google
        </Button>

        {/* Login Link */}
        <div className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" legacyBehavior>
            <a className="text-blue-500 font-semibold hover:underline">LOGIN</a>
          </Link>
        </div>

        {/* Error Message */}
        {signupError && (
          <p className="text-red-500 text-sm mt-4 text-center">{signupError}</p>
        )}
      </div>
    </div>
  );
};

export default Signup;
