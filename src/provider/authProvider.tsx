import React, {createContext, ReactNode, useContext, useEffect, useMemo, useState} from "react";
import {UserToken} from "../types";
import {setupAxiosInterceptors} from "../configuration/axiosConfig";

interface AuthContextType {
    tokenData: UserToken | null;
    setTokenData: (tokenData: UserToken | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [tokenData, setToken] = useState<UserToken | null>(null);

    const logout = () => {
        sessionStorage.removeItem("token");
        setToken(null);
    };

    useEffect(() => {
        const tokenString = sessionStorage.getItem('token');
        const userToken: UserToken | null = tokenString ? JSON.parse(tokenString) : null;
        setTokenData(userToken);

        setupAxiosInterceptors(logout);
    }, []);

    const setTokenData = (userToken: UserToken | null) => {
        if (userToken) {
            sessionStorage.setItem('token', JSON.stringify(userToken));
            setToken(userToken);
        } else {
            sessionStorage.removeItem('token');
            setToken(null);
        }
    };

    const contextValue = useMemo(
        () => ({
            tokenData,
            setTokenData,
        }),
        [tokenData]
    );

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthProvider;
