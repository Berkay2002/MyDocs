// src/components/BodyContent.js
"use client";

import { useEffect } from "react";
import { useAuth } from "../../AuthContext";
import Navbar from "../components/Navbar/Navbar";

const BodyContent = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      document.body.classList.add("logged-in");
    } else {
      document.body.classList.remove("logged-in");
    }
  }, [user]);

  return (
    <>
      {user && <Navbar />}
      {children}
    </>
  );
};

export default BodyContent;