// src/components/Signup.js
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore, setDoc, doc, getDocs, collection, query, where } from "../../firebase";
import { useRouter } from "next/navigation";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [signUpError, setSignUpError] = useState(null);
  const router = useRouter();

  const generateFourDigitID = () => Math.floor(1000 + Math.random() * 9000).toString();

  const isUniqueUsernameID = async (username, userId) => {
    const usernamesQuery = query(
      collection(firestore, "users"),
      where("username", "==", username),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(usernamesQuery);
    return snapshot.empty;
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    const chosenUsername = username || email.split("@")[0];
    const userId = generateFourDigitID();

    try {
      const isUnique = await isUniqueUsernameID(chosenUsername, userId);
      if (!isUnique) {
        setSignUpError("Generated username with ID already exists. Try again.");
        return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(firestore, "users", user.uid), { username: chosenUsername, userId, email });
      router.push("/");
    } catch (error) {
      console.error("Error signing up:", error);
      setSignUpError(error.message);
    }
  };

  return (
    <div className="flex flex-col p-8 gap-4 text-black min-w-80">
      <form onSubmit={handleSignUp}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username (optional)"
          className="p-2 rounded-sm"
        />
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
          Sign Up
        </button>
      </form>
      {signUpError && <p className="text-red-500 text-sm">{signUpError}</p>}
    </div>
  );
};

export default SignUp;