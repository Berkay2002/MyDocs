// src/app/friends/page.js
"use client";

import { useAuth } from "../../../AuthContext";
import FriendList from "../../components/Friends/FriendList";
import FriendRequests from "../../components/Friends/FriendRequest";
import FriendControl from "../../components/Friends/FriendControl";

const FriendsPage = () => {
    const { user } = useAuth();

    if (!user) return <p className="text-center text-red-500">Please log in to view your friends.</p>;

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-4 text-center">Friends</h1>
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">Add a Friend</h2>
                <FriendControl />
            </div>
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-2">Friend Requests</h2>
                <FriendRequests />
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-2">Your Friends</h2>
                <FriendList />
            </div>
        </div>
    );
};

export default FriendsPage;