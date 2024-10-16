import React from 'react';
import '../styles.css';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import NavBar from "./navigation/NavBar";
import UserList from "./user/UserList";
import Login from "./authentication/Login";
import useToken from "../useToken";
import Register from "./authentication/Register";
import RelationshipList from "./RelationshipList";
import ReceivedNewsList from "./news/ReceivedNewsList";
import FriendProfile from "./user/FriendProfile";
import MyProfile from "./user/MyProfile";
import EditProfile from "./user/EditProfile";

const App: React.FC = () => {
    const { tokenData, setTokenData } = useToken();

    if (!tokenData?.token) {
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
            <div className="navbar">
                <NavBar setTokenData={setTokenData} />
            </div>
            <div className="main-content">
                <Routes>
                    <Route path="/user/:uuid" element={<FriendProfile />} />
                    <Route path="/me" element={<MyProfile />} />
                    <Route path="/me/edit" element={<EditProfile setTokenData={setTokenData}/>} />
                    <Route path="/search/:query" element={<UserList />} />
                    <Route path="/friends" element={<RelationshipList />} />
                    <Route path="/" element={<ReceivedNewsList />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
