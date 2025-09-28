import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import searchIcon from '../assets/search.png';

const Searchbar = ({ onSearchChange, placeholder = "Search..." }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

    useEffect(() => {
        if (searchTerm) {
            setSearchParams({ search: searchTerm });
        } else {
            setSearchParams({});
        }
        
        // Call the onSearchChange callback if provided
        if (onSearchChange) {
            onSearchChange(searchTerm);
        }
    }, [searchTerm, setSearchParams, onSearchChange]);

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="flex items-center rounded py-1.5 px-3 bg-white border border-gray-300">
            <img src={searchIcon} alt="Search" className="w-4 h-4 mr-2" />
            <input
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="flex-1 outline-none"
            />
        </div>
    );
};

export default Searchbar;