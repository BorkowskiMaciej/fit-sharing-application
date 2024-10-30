import { useEffect, useState } from 'react';
import axiosInstance from '../configuration/axiosConfig';
import { User } from '../types';

export const useFetchUser = (fsUserId?: string) => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const url = fsUserId ? `/users/${fsUserId}` : `/users/me`;
                await axiosInstance
                    .get(url)
                    .then(response => {
                        setUser(response.data)
                        setError(null);
                    });
            } catch (err) {
                setError('User not found or error occurred');
                setUser(null);
            }
        };

        if (fsUserId || fsUserId === undefined) {
            fetchUser();
        }
    }, [fsUserId]);

    return { user, error };
};
