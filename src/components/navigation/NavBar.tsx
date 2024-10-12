import React from 'react';
import SearchBar from './SearchBar';
import { Link } from "react-router-dom";
import GlobalMessages from "./GlobalMessage";

const Navbar: React.FC = () => {
    return (
        <div className="navbar">
            <div className="navbar-section">
                <h2 className="navbar-title">Fit Sharing</h2>
                <SearchBar />
            </div>
            <GlobalMessages />
            <div className="navbar-section">
                <Link to="/friends" className="navbar-link">Friends</Link>
                <Link to="/user/me" className="navbar-link">My Profile</Link>
            </div>
        </div>
    );
};

export default Navbar;
