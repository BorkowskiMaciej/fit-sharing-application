import React from 'react';
import './styles.css';
import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import NavBar from "./components/navigation/NavBar";
import UserList from "./components/user/UserList";
import Login from "./components/authentication/Login";
import useToken from "./hooks/useToken";
import Register from "./components/authentication/Register";
import RelationshipList from "./components/relationship/RelationshipList";
import FriendProfile from "./components/user/FriendProfile";
import MyProfile from "./components/user/MyProfile";
import EditProfile from "./components/user/EditProfile";
import ResetPassword from "./components/authentication/ResetPassword";
import ChangePassword from "./components/user/ChangePassword";
import {MainComponent} from "./components/MainComponent";

const App: React.FC = () => {
    const { tokenData, setTokenData } = useToken();

    if (!tokenData?.token) {
        return (
            <Router>
                <Routes>
                    <Route path="/login" element={<Login setToken={setTokenData} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
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
                    <Route path="/me/change-password" element={<ChangePassword />} />
                    <Route path="/search/:query" element={<UserList />} />
                    <Route path="/relationships" element={<RelationshipList />} />
                    <Route path="/" element={<MainComponent />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
