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
                placeholder="Enter UUID"
                value={input}
                onChange={handleInputChange}
                className="search-input"
            />
            <button onClick={handleSearch} className="search-button">
                Search
            </button>
        </div>
    );
};

export default SearchBar;
