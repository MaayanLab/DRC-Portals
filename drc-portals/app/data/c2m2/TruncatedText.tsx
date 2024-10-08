'use client'
import React from 'react';
import Typography from '@mui/material/Typography';

interface TruncatedTextProps {
    text: string;
    maxLength: number;
}

const TruncatedText: React.FC<TruncatedTextProps> = ({ text, maxLength }) => {
    if (!text) {
        return null;
    }

    const truncatedText = text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;

    return (
        <Typography
            variant="body2"
            style={{
                overflowWrap: 'break-word',
                cursor: 'pointer',
            }}
            title={text.length > maxLength ? text : ''}
        >
            {truncatedText}
        </Typography>
    );
};

export default TruncatedText;
