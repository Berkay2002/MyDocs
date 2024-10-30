// src/components/Login.js
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, firestore, signInWithGoogle, setDoc, doc, getDoc } from "../../firebase";
import { useRouter } from "next/navigation";

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
    <div className="flex flex-col p-8 gap-4 text-black min-w-80">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="p-2 rounded-sm"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="p-2 rounded-sm"
        />
        <button type="submit" className="p-2 rounded-sm bg-green-500 font-semibold text-lg text-white">
          Login
        </button>
      </form>
      <button
        onClick={handleGoogleLogin}
        className="p-2 rounded-sm bg-blue-500 font-semibold text-lg text-white mt-4"
      >
        Sign in with Google
      </button>
      {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
    </div>
  );
};

export default Login;