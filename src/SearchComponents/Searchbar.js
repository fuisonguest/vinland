import React, { useState, useRef, useEffect } from 'react';
import { MDBBtn, MDBIcon, MDBInputGroup } from 'mdb-react-ui-kit';
import { Box, Text, Flex } from '@chakra-ui/react';

export default function Searchbar() {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setInput(value);
  };
  
  const onSubmit = (e) => {
    e.preventDefault();
    let newUrl = `/results?query=${encodeURIComponent(input)}`;
    window.location.href = newUrl;
  };

  // Handle click outside to remove focus effect
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Recent searches - would normally be stored in localStorage
  const recentSearches = ['iphone 13', '2bhk apartment', 'honda city', 'jobs in bangalore'];

  return (
    <div className={`search-container w-100 ${isFocused ? 'search-focused' : ''}`} ref={searchRef}>
      <form onSubmit={onSubmit} className="search-form">
        <MDBInputGroup className="mx-3 my-1">
          {/* Search input */}
          <input
            className="form-control"
            placeholder="Find Cars, Mobile Phones, Properties and more..."
            aria-label="Search"
            type="search"
            value={input}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
          />
          
          {/* Clear input button - only shows when there's text */}
          {input && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setInput('')}
            >
              <MDBIcon icon='times' className="text-muted" />
            </button>
          )}
          
          {/* Search button */}
          <MDBBtn type="submit" className="search-button">
            <MDBIcon icon='search' />
          </MDBBtn>
        </MDBInputGroup>
        
        {/* Recent searches dropdown - only shows when focused and no input */}
        {isFocused && !input && (
          <Box 
            position="absolute"
            top="calc(100% - 2px)"
            left={0}
            right={0}
            bg="white"
            boxShadow="lg"
            borderRadius="0 0 15px 15px"
            zIndex={999}
            p={3}
            className="search-suggestions"
          >
            <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={2} px={2}>
              RECENT SEARCHES
            </Text>
            
            {recentSearches.map((term, index) => (
              <Flex 
                key={index}
                align="center" 
                p={2}
                borderRadius="md"
                cursor="pointer"
                _hover={{ bg: 'gray.50' }}
                onClick={() => {
                  setInput(term);
                  document.querySelector('.search-container form').submit();
                }}
              >
                <MDBIcon far icon="clock" className="me-2 text-muted" />
                <Text>{term}</Text>
              </Flex>
            ))}
          </Box>
        )}
      </form>
    </div>
  );
}
