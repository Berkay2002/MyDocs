// src/components/Friends/FriendList.js
import { useEffect, useState } from "react";
import { firestore } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../../AuthContext";

const FriendList = () => {
    const { user } = useAuth();
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        if (!user) return;

        const unsubscribe = onSnapshot(
            collection(firestore, `users/${user.uid}/friends`),
            (snapshot) => {
                const acceptedFriends = snapshot.docs
                    .filter((doc) => doc.data().status === "accepted")
                    .map((doc) => ({ id: doc.id, ...doc.data() }));
                setFriends(acceptedFriends);
            }
        );

        return () => unsubscribe();
    }, [user]);

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Friends List</h2>
            {friends.length > 0 ? (
                friends.map((friend) => (
                    <div
                        key={friend.id}
                        className="p-2 mb-2 border-b border-gray-200 flex justify-between items-center"
                    >
                        <p className="text-gray-700">{friend.username}</p>

                    </div>
                ))
            ) : (
                <p className="text-gray-500">No friends yet</p>
            )}
        </div>
    );
};

export default FriendList;