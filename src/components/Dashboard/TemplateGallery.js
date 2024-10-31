// src/components/dashboard/TemplateGallery.js

"use client";

import React from 'react';
import { Card, Typography, Box, ButtonBase } from '@mui/material';
import Grid from "@mui/material/Grid2"; 
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { firestore, doc, setDoc, serverTimestamp } from '../../../firebase';
import { useAuth } from '../../../AuthContext';


const templates = [
  {
    name: 'Blank',
    image: '/templates/blank.png',
    content: '',
  },
  {
    name: 'Resume',
    image: '/templates/resume.png',
    content: 'Your resume template content here...',
  },
  {
    name: 'Letter',
    image: '/templates/letter.png',
    content: 'Your letter template content here...',
  },
  // Add more templates as needed
];

const TemplateGallery = () => {
    const router = useRouter();
    const { user } = useAuth();
  
    const handleTemplateClick = async (template) => {
      if (!user) {
        router.push("/login");
        return;
      }
  
      try {
        // Generate a new document ID
        const docId = uuidv4();
        const docRef = doc(firestore, "documents", docId);
  
        // Set the document data based on the selected template
        await setDoc(docRef, {
          title: `${template.name} Document`,
          content: template.content,
          ownerId: user.uid,
          editors: { [user.uid]: true },
          viewers: {},
          lastModified: serverTimestamp(),
          isShared: false,
          template: template.name,
        });
  
        // Redirect to the editor page for the new document
        router.push(`/editor/${docId}`);
      } catch (error) {
        console.error("Error creating new document:", error);
      }
    };
  
    return (
      <div>
        <Typography variant="h6" gutterBottom>
          Start a new document
        </Typography>
        <Grid container spacing={2}>
          {templates.map((template) => (
            <Grid item xs={6} md={3} key={template.name}>
              <ButtonBase
                onClick={() => handleTemplateClick(template)}
                sx={{ width: "100%" }}
              >
                <Card
                  sx={{
                    width: "100%",
                    padding: 1,
                    textAlign: "center", 
                    "&:hover": {
                      boxShadow: 6,
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 150,
                      backgroundImage: `url(${template.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <Typography variant="subtitle1" sx={{ mt: 1 }}>
                    {template.name}
                  </Typography>
                </Card>
              </ButtonBase>
            </Grid>
          ))}
        </Grid>
      </div>
    );
  };
  
  export default TemplateGallery;

/* const templates = [
  {
    name: "Blank",
    image: "/templates/blank.png",
    content: "",
  },
  {
    name: "Resume",
    image: "/templates/resume.png",
    content: "Your resume template content here...",
  },
  {
    name: "Letter",
    image: "/templates/letter.png",
    content: "Your letter template content here...",
  },
  // Add more templates as needed
];

const TemplateGallery = () => {
  const router = useRouter();
  const { user } = useAuth();

  const handleTemplateClick = async (template) => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      // Generate a new document ID
      const docId = uuidv4();
      const docRef = doc(firestore, "documents", docId);

      // Set the document data based on the selected template
      await setDoc(docRef, {
        title: `${template.name} Document`,
        content: template.content,
        ownerId: user.uid,
        editors: { [user.uid]: true },
        viewers: {},
        lastModified: serverTimestamp(),
        isShared: false,
        template: template.name,
      });

      // Redirect to the editor page for the new document
      router.push(`/editor/${docId}`);
    } catch (error) {
      console.error("Error creating new document:", error);
    }
  };

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Start a new document
      </Typography>
      <Grid container spacing={2}>
        {templates.map((template) => (
          <Grid item xs={6} md={3} key={template.name}>
            <ButtonBase
              onClick={() => handleTemplateClick(template)}
              sx={{ width: "100%" }}
            >
              <Card
                sx={{
                  width: "100%",
                  padding: 1,
                  textAlign: "center",
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
              >
                <Box
                  sx={{
                    height: 150,
                    backgroundImage: `url(${template.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  {template.name}
                </Typography>
              </Card>
            </ButtonBase>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default TemplateGallery; */