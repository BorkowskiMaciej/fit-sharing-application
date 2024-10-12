import { useState, useEffect } from 'react';

type UserToken = {
    fsUserId: string;
    token: string;
    expiresIn: number;
};

export default function useToken() {
    const [tokenData, setTokenData] = useState<UserToken | null>(null);

    useEffect(() => {
        const tokenString = sessionStorage.getItem('token');
        const userToken: UserToken | null = tokenString ? JSON.parse(tokenString) : null;
        setTokenData(userToken);
    }, []);

    const saveToken = (userToken: UserToken) => {
        sessionStorage.setItem('token', JSON.stringify(userToken));
        setTokenData(userToken);
    };

    return {
        setTokenData: saveToken,
        tokenData,
    };
}
