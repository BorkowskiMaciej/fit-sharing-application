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
            <Route path="/user/:uuid" element={<UserProfile />} />
            <Route path="/search/:query" element={<UserList />} />
        </Routes>
    </Router>
    );
};

export default App;
