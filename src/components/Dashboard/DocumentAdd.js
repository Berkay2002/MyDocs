// src/components/Dashboard/DocumentAdd.js
import { useState } from "react";
import React from 'react';
import ConfirmModal from "../ConfirmModal";
import { firebase, firestore, doc, setDoc, serverTimestamp } from "../../../firebase";
import { useAuth } from '../../../AuthContext';
import { useRouter } from "next/navigation";
import { Button, IconButton, Icon } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleIcon from "@mui/icons-material/People";
import Image from "next/image";
import { v4 as uuidv4 } from 'uuid';

const DocumentAdd = ({ email }) => {
  const [inputValue, setInputValue] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const createDocument = async () => {
    if (inputValue.trim() === "") return;

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      // Generate a new document ID
      const docId = uuidv4();
      const docRef = doc(firestore, "documents", docId);

      // Set the document data
      await setDoc(docRef, {
        title: inputValue,
        content: "",
        ownerId: user.uid,
        editors: { [user.uid]: true },
        viewers: {},
        lastModified: serverTimestamp(),
        isShared: false,
        template: "Blank",
      });

      closeModal();
      router.push(`/editor/${docId}`);
    } catch (error) {
      console.error("Error creating new document:", error);
    }
  };

  const closeModal = () => {
    setInputValue("");
    setIsOpenModal(false);
  };

  return (
    <>
      <ConfirmModal
        isOpen={isOpenModal}
        inputValue={inputValue}
        setInputValue={setInputValue}
        body="To create a new document, please enter the name of the document here. We will do the rest for you."
        onSubmit={createDocument}
        onClose={closeModal}
      />
      <section className="bg-[#f1f3f4] pb-10 px-7 sm:!px-10">
        <div className="max-w-3xl mx-auto">
          <div className="py-6 flex items-center justify-between">
            <h2 className="text-gray-800 text-lg">Start a new Document</h2>
            <Button
              color="gray"
              ripple="dark"
              className="border-0 hover:!bg-[#bdc1c6] rounded-full"
            >
              <Icon name="more_vert" size="3xl" />
            </Button>
          </div>
          <div>
            <div
              className="relative h-40 w-32 sm:!h-52 sm:!w-40 cursor-pointer border rounded hover:border-blue-600"
              onClick={() => setIsOpenModal(true)}
            >
              <Image
                src="/blank-doc.png"
                fill
                className="rounded active:opacity-50"
                alt="Blank Document"
              />
            </div>
            <p className="ml-2 mt-2 font-medium text-sm text-gray-800">Blank</p>
          </div>
        </div>
      </section>
    </>
  );
};

export default DocumentAdd;