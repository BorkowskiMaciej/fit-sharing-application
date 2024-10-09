import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
    username: string;
    firstName: string;
    lastName: string;
    age: number;
    description: string;
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users', error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div>
            <h1>User List</h1>
            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                users.map(user => (
                    <div key={user.username}>
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
