import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar: React.FC = () => {
    const [input, setInput] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInput(event.target.value);
    };

    const handleSearch = () => {
        if (input) {
            navigate(`/search/${input}`);
            setInput('');
        }
    };

    return (
        <div className="search-bar-container">
            <input
                type="text"
                placeholder="Find user"
                value={input}
                onChange={handleInputChange}
                className="search-input"
            />
            <div onClick={handleSearch}>
                <svg className="w-6 h-6 text-gray-800 dark:text-white navbar-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
        </div>
    );
};

export default SearchBar;
