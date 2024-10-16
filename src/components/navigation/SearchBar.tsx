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
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
        </div>
    );
};

export default SearchBar;
