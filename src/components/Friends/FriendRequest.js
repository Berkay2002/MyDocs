// src/components/Friends/FriendRequests.js
import { useEffect, useState } from "react";
import { firestore, acceptFriendRequest, rejectFriendRequest } from "../../../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { useAuth } from "../../../AuthContext";

const FriendRequests = () => {
    const { user } = useAuth();
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);

    useEffect(() => {
        if (!user) return;

        // Fetch received friend requests
        const unsubscribeReceived = onSnapshot(
            collection(firestore, "friendRequests"),
            (snapshot) => {
                const requests = snapshot.docs
                    .filter((doc) => doc.data().receiverId === user.uid && doc.data().status === "pending")
                    .map((doc) => ({ id: doc.id, ...doc.data() }));
                setReceivedRequests(requests);
            }
        );

        // Fetch sent friend requests
        const unsubscribeSent = onSnapshot(
            collection(firestore, "friendRequests"),
            (snapshot) => {
                const requests = snapshot.docs
                    .filter((doc) => doc.data().senderId === user.uid && doc.data().status === "pending")
                    .map((doc) => ({ id: doc.id, ...doc.data() }));
                setSentRequests(requests);
            }
        );

        return () => {
            unsubscribeReceived();
            unsubscribeSent();
        };
    }, [user]);

    const handleAccept = async (requestId) => {
        await acceptFriendRequest(requestId);
    };

    const handleReject = async (requestId) => {
        await rejectFriendRequest(requestId);
    };

    return (
        <div className="p-4">
            <h4 className="text-xl font-semibold mb-4">Received Requests</h4>
            {receivedRequests.map((req) => (
                <div key={req.id} className="mb-4 p-4 border rounded-lg shadow-sm">
                    <p className="mb-2">From: {req.senderId}</p>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => handleAccept(req.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => handleReject(req.id)}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Reject
                        </button>
                    </div>
                </div>
            ))}

            <h4 className="text-xl font-semibold mb-4">Sent Requests</h4>
            {sentRequests.map((req) => (
                <div key={req.id} className="mb-4 p-4 border rounded-lg shadow-sm">
                    <p className="mb-2">To: {req.receiverId}</p>
                    <p className="text-gray-500">Status: Pending</p>
                </div>
            ))}
        </div>
    );
};

export default FriendRequests;