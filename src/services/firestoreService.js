import { firestore, doc, setDoc, getDoc, updateDoc } from '../../firebase';
import CryptoJS from 'crypto-js';

// Secret key for encryption
const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY;

// Create a new document with encrypted data
export const createDocument = async (docId, ownerId) => {
  const encryptedContent = CryptoJS.AES.encrypt("", SECRET_KEY).toString(); // Initialize with empty content

  await setDoc(doc(firestore, 'documents', docId), {
    ownerId,
    editors: {},
    content: encryptedContent, // Changed from 'ydoc' to 'content'
    timestamp: new Date(),
  });
};

// Save encrypted content
export const saveContent = async (docId, content) => {
  const encryptedContent = CryptoJS.AES.encrypt(content, SECRET_KEY).toString();
  await setDoc(doc(firestore, 'documents', docId), {
    content: encryptedContent,
  }, { merge: true });
};

// Get document metadata and decrypted content
export const getDocument = async (docId) => {
  const docRef = doc(firestore, 'documents', docId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const decryptedContent = data.content 
      ? CryptoJS.AES.decrypt(data.content, SECRET_KEY).toString(CryptoJS.enc.Utf8) 
      : "";
    return { ...data, content: decryptedContent };
  }
  return null;
};

// Update document fields (e.g., title)
export const updateDocument = async (docId, updatedFields) => {
  const docRef = doc(firestore, 'documents', docId);
  await updateDoc(docRef, updatedFields);
};
