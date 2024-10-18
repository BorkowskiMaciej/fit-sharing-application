import { useState, useEffect } from 'react';
import {UserToken} from "../types";

export default function useToken() {
    const [tokenData, setTokenData] = useState<UserToken | null>(null);

    useEffect(() => {
        const tokenString = sessionStorage.getItem('token');
        const userToken: UserToken | null = tokenString ? JSON.parse(tokenString) : null;
        setTokenData(userToken);
    }, []);

    const saveToken = (userToken: UserToken | null) => {
        if (userToken) {
            sessionStorage.setItem('token', JSON.stringify(userToken));
            setTokenData(userToken);
        } else {
            sessionStorage.removeItem('token');
            setTokenData(null);
        }
    };

    return {
        setTokenData: saveToken,
        tokenData,
    };
}
