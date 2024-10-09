import React from 'react';
import '../styles.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import UserProfile from "./UserProfile";
import Navbar from "./Navbar";
import UserList from "./UserList";

const App: React.FC = () => {

    return (
    <Router>
        <Navbar />
        <Routes>
            <Route path="/" element={<UserList />} />
            <Route path="/user/:uuid" element={<UserProfile />} />
        </Routes>
    </Router>
    );
};

export default App;
