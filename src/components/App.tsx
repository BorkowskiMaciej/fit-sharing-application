import React from 'react';
import '../styles.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import UserProfile from "./UserProfile";
import Navbar from "./Navbar";
import UserList from "./UserList";
import Login from "./Login";
import useToken from "../useToken";

const App: React.FC = () => {

    const { tokenData, setTokenData } = useToken();

    if (!tokenData || !tokenData.token) {
        return <Login setToken={setTokenData} />
    }

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
