// /src/app/protected/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import withAuth from "../../utils/withAuth";
import { useAuth } from "../../../AuthContext";
import { firestore, doc, getDoc } from "../../../firebase";
import Editor from "../../components/Editor/Editor";
import SignOut from "../../components/Signout";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2"; 

const ProtectedPage = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(firestore, "users", user.uid));
          if (userDoc.exists()) {
            const { username, userId } = userDoc.data();
            setDisplayName(`${username}#${userId}`);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUsername();
  }, [user]);

  return (
    <Container className="min-h-screen p-6">
      <Grid container spacing={6}>
        <Grid xs={12} md={3}> {/* Removed 'item' prop */}
          <Box className="flex flex-col items-start gap-4" sx={{ padding: 2 }}>
            <SignOut />
            <Link href="/settings">
              <Button variant="contained" color="primary" fullWidth>
                Go to User Settings
              </Button>
            </Link>
            <Link href="/friends">
              <Button variant="contained" color="primary" fullWidth>
                Go to Friends Page
              </Button>
            </Link>
          </Box>
        </Grid>
        <Grid xs={12} md={6}>
          <Box className="flex flex-col items-center gap-4" sx={{ padding: 2 }}>
            <Typography variant="body1">
              Only logged-in users can see this page.
            </Typography>
            {user && (
              <Typography variant="body1">
                Logged in as: {displayName}
              </Typography>
            )}
            <Editor documentId="CbV9yWyrN9EKlMMCHu3e" />
          </Box>
        </Grid>
        <Grid xs={12} md={3}>
          <Box sx={{ padding: 2 }}>
            {/* Additional content can be added here */}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default withAuth(ProtectedPage);
