// src/components/UserProfile/ProfilePictureUpload.js
import { useState } from "react";
import { firestore, storage } from "../../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateDoc, doc } from "firebase/firestore";

const ProfilePictureUpload = ({ userId }) => {
  const [image, setImage] = useState(null);

  const handleImageUpload = async () => {
    if (image) {
      const storageRef = ref(storage, `profilePictures/${userId}`);
      await uploadBytes(storageRef, image);
      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(firestore, "users", userId), {
        profilePicture: downloadURL,
      });
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <button onClick={handleImageUpload}>Upload</button>
    </div>
  );
};

export default ProfilePictureUpload;
