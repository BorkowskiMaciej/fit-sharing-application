import { useState } from 'react';

type UserToken = {
    token: string;
    expiresIn: number;
};

export default function useToken() {
    const getToken = () => {
        const tokenString = sessionStorage.getItem('token');
        const userToken: UserToken | null = tokenString ? JSON.parse(tokenString) : null;
        return userToken;
    };

    const [tokenData, setTokenData] = useState<UserToken | null>(getToken());

    const saveToken = (userToken: UserToken) => {
        sessionStorage.setItem('token', JSON.stringify(userToken));
        setTokenData(userToken);
    };

    return {
        setTokenData: saveToken,
        token: tokenData?.token,
        tokenData
    };
}
