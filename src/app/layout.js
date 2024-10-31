// src/app/layout.js

import { Inter } from "next/font/google";
import { AuthProvider } from "../../AuthContext";
import BodyContent from "../components/BodyContent"; // Import the client component
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MyDocs",
  description: "A simple document editor",
  icons: {
    icon: "/MainLogo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <BodyContent>{children}</BodyContent>
        </AuthProvider>
      </body>
    </html>
  );
}