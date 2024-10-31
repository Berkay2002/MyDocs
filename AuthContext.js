// src/AuthContext.js
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, firestore, getDoc, doc } from "./firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [usernameWithId, setUsernameWithId] = useState("");
  const [profilePicture, setProfilePicture] = useState(
    "/default-profile.jpg"
  );
  const [loading, setLoading] = useState(true);

  // Logout function
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUsernameWithId("");
    setProfilePicture("/default-profile.jpg");
  };

  // Listen for changes in the user's authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Fetch user document data from Firestore
        const userDoc = await getDoc(
          doc(firestore, "users", currentUser.uid)
        );
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsernameWithId(`${data.username}#${data.userId}`);
          setProfilePicture(
            data.profilePicture || "/default-profile.jpg"
          );
        }
        setUser(currentUser);
      } else {
        // Reset data if no user is authenticated
        setUser(null);
        setUsernameWithId("");
        setProfilePicture("/default-profile.jpg");
      }
      setLoading(false);
    });

    // Clean up the subscription on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, usernameWithId, profilePicture, loading, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
