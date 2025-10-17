import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  fullWidth = true,
  size = "medium",
  ...props 
}) => {
  return (
    <TextField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      fullWidth={fullWidth}
      size={size}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      }}
      variant="outlined"
      {...props}
    />
  );
};

export default SearchBar;