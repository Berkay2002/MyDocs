// src/app/page.js

"use client";

import React from "react";
import { useAuth } from "../../AuthContext";
import TemplateGallery from "../components/Dashboard/TemplateGallery";
import RecentDocuments from "../components/Dashboard/RecentDocuments";
import { Container } from "@mui/material";
import Link from "next/link";
import SignOut from "@/components/Signout";

export default function Dashboard() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    // If the user is not authenticated, show a message or redirect to login
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="flex flex-col items-center">
          <p className="text-xl">You are not signed in.</p>
          <Link href="/login">
            <button className="p-2 rounded-sm bg-blue-500 text-lg font-semibold text-white w-48">
              Login here
            </button>
          </Link>
          <Link href="/signup">
            <button className="p-2 rounded-sm bg-blue-500 text-lg font-semibold text-white w-48 mt-4">
              Signup here
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <TemplateGallery />
      <RecentDocuments />
    </Container>
  );
}
