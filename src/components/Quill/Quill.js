// src/components/Editor/Quill/Quill.js
import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const QuillEditor = ({ documentId, value, onChange }) => {
  const quillRef = useRef(null);

  useEffect(() => {
    if (quillRef.current) return;

    // Initialize Quill
    quillRef.current = new Quill('#quill-editor', {
      theme: 'snow',
      modules: {
        toolbar: true,
      },
    });

    // Set initial content
    quillRef.current.root.innerHTML = value;

    // Listen for text changes
    quillRef.current.on('text-change', () => {
      const html = quillRef.current.root.innerHTML;
      onChange(html);
    });
  }, [documentId, onChange]);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value;
    }
  }, [value]);

  return <div id="quill-editor" style={{ height: '400px' }} />;
};

export default QuillEditor;