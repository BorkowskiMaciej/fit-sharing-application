import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { User } from '../types';
import UserCard from "./UserCard";

const UserList = () => {
    const { query } = useParams();
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const url = `http://localhost:8080/users/search?searchTerm=${query}`;
                const response = await axios.get(url);
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users', error);
            }
        };

        fetchUsers();
    }, [query]);

    return (
        <div>
            <h1>{query ? `Search Results for "${query}"` : "User List"}</h1>
            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                users.map(user => (
                    <UserCard key={user.username} user={user} />
                ))
            )}
        </div>
    );
};

export default UserList;
