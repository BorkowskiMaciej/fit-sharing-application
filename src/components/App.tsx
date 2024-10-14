import React from 'react';
import '../styles.css';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import UserProfile from "./user/UserProfile";
import NavBar from "./navigation/NavBar";
import UserList from "./user/UserList";
import Login from "./authentication/Login";
import useToken from "../useToken";
import Register from "./authentication/Register";
import RelationshipList from "./RelationshipList";
import NewsList from "./news/NewsList";

const App: React.FC = () => {
    const { tokenData, setTokenData } = useToken();

    if (!tokenData || !tokenData.token) {
        return (
            <Router>
                <Routes>
                    <Route path="/login" element={<Login setToken={setTokenData} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        );
    }

    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/user/:uuid" element={<UserProfile />} />
                <Route path="/search/:query" element={<UserList />} />
                <Route path="/friends" element={<RelationshipList />} />
                <Route path="*" element={<NewsList />} />
            </Routes>
        </Router>
    );
};

export default App;
