// /src/components/Signout.js
import { useAuth } from "../../AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";

const clearCookies = () => {
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
};

const clearLocalStorage = () => {
  localStorage.clear();
};

const clearSessionStorage = () => {
  sessionStorage.clear();
};

const SignOut = () => {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      clearCookies();
      clearLocalStorage();
      clearSessionStorage();
      console.log("User signed out, cache cleared");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (!user) return null;

  return (
    <button
      onClick={handleSignOut}
      className="p-2 rounded-sm bg-red-500 font-semibold text-white"
    >
      Sign Out
    </button>
  );
};

export default SignOut;