// src/firebase.js
import { initializeApp } from "firebase/app";
import { 
  getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc, arrayUnion, serverTimestamp, orderBy, onSnapshot
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Cache to store usernames temporarily
const userCache = {};

// Fetch username by userId
const getUsernameById = async (userId) => {
  if (userCache[userId]) return userCache[userId]; // Return cached username if available

  const userDoc = await getDoc(doc(firestore, "users", userId));
  if (userDoc.exists()) {
    const username = userDoc.data().username;
    userCache[userId] = username; // Cache the username
    return username;
  } else {
    return userId; // Fallback to userId if username not found
  }
};

const signInWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

const uploadProfilePicture = async (userId, file) => {
  const storageRef = ref(storage, `profilePictures/${userId}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

// Helper function to find a user by email or displayTag (username#ID)
const findUserByIdentifier = async (identifier) => {
  const usersRef = collection(firestore, "users");
  let userQuery;

  if (identifier.includes("@")) {
    userQuery = query(usersRef, where("email", "==", identifier));
  } else if (identifier.includes("#")) {
    const [username, userId] = identifier.split("#");
    userQuery = query(usersRef, where("username", "==", username), where("userId", "==", userId));
  } else {
    return null;
  }

  const querySnapshot = await getDocs(userQuery);
  return querySnapshot.empty ? null : { ...querySnapshot.docs[0].data(), uid: querySnapshot.docs[0].id };
};

// Send a friend request
const sendFriendRequest = async (senderId, receiverId) => {
  const requestRef = doc(collection(firestore, "friendRequests"));
  await setDoc(requestRef, {
    senderId,
    receiverId,
    status: "pending",
    timestamp: new Date()
  });
};

// Accept a friend request
const acceptFriendRequest = async (requestId) => {
  const requestRef = doc(firestore, "friendRequests", requestId);
  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) return;

  const { senderId, receiverId } = requestSnap.data();

  // Update status to "accepted"
  await updateDoc(requestRef, { status: "accepted" });

  // Add both users to each other’s friend lists
  await setDoc(doc(firestore, `users/${senderId}/friends`, receiverId), { status: "accepted" });
  await setDoc(doc(firestore, `users/${receiverId}/friends`, senderId), { status: "accepted" });
};

// Reject a friend request
const rejectFriendRequest = async (requestId) => {
  const requestRef = doc(firestore, "friendRequests", requestId);
  await deleteDoc(requestRef); // Deletes the friend request document
};

export { 
  auth, firestore, storage, signInWithGoogle, findUserByIdentifier, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, uploadProfilePicture,
  getDoc, setDoc, doc, collection, query, where, getDocs, updateDoc, arrayUnion, deleteDoc, ref, uploadBytes, getDownloadURL, getUsernameById, 
  serverTimestamp, orderBy, onSnapshot
};
