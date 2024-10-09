import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { User } from '../types';

const UserList = () => {
    const { query } = useParams();
    const [users, setUsers] = useState<User[]>([]);
    const navigate = useNavigate();

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
                    <div key={user.username} onClick={() => navigate(`/user/${user.fsUserId}`)}>
                        <h2>{user.username}</h2>
                        <p>{`${user.firstName} ${user.lastName}`}</p>
                        <p>Wiek: {user.age}</p>
                        <p>Opis: {user.description}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default UserList;
