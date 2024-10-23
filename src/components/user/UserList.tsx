import React, { useEffect, useState } from 'react';
import axiosInstance from '../../configuration/axiosConfig';
import { useParams } from 'react-router-dom';
import { User } from '../../types';
import UserCard from "./UserCard";

const UserList = () => {
    const { query } = useParams();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosInstance.get(`/users/search?searchTerm=${query}`);
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users', error);
            }
        };

        fetchUsers();
    }, [query]);

    return (
        <div className="user-list-container">
            {users.length === 0 ? (
                <p>No users found. Change the search query.</p>
            ) : (
                users.map(user => (
                    <UserCard key={user.username}
                              username={user.username}
                              firstName={user.firstName}
                              lastName={user.lastName}
                              fsUserId={user.fsUserId}
                              profilePicture={user.profilePicture}
                    />
                ))
            )}
        </div>
    );
};

export default UserList;
