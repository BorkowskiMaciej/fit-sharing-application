import React from 'react';
import SearchBar from './SearchBar';

const Navbar: React.FC = () => {

    return (
        <div className="navbar">
            <h1 className="navbar-title">My App</h1>
            <SearchBar />
        </div>
    );
};

export default Navbar;
