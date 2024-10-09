import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar: React.FC = () => {
    const [uuid, setUuid] = useState<string>('');
    const navigate = useNavigate();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUuid(event.target.value);
    };

    const handleSearch = () => {
        if (uuid) {
            navigate(`/user/${uuid}`);
            setUuid('');
        }
    };

    return (
        <div className="search-bar-container">
            <input
                type="text"
                placeholder="Enter UUID"
                value={uuid}
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
