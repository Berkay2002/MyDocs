// src/app/editor/[id]/page.js

"use client";

import React from "react";
import Editor from "../../../components/Editor/Editor";
import { useParams } from "next/navigation";

const EditorPage = () => {
  const params = useParams();
  const { id: documentId } = params;

  return <Editor documentId={documentId} />;
};

export default EditorPage;
