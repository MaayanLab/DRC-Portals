// ParentComponent.jsx
'use client';  // Ensure this is a client component
import { useState } from 'react';
import QueryForm from './QueryForm';
import ReviewPage from './ReviewPage';

export default function ParentComponent() {
    const [selectedSchema, setSelectedSchema] = useState(null);
    const [selectedTable, setSelectedTable] = useState(null);

    return (
        <>
            <QueryForm 
                selectedSchema={selectedSchema} 
                setSelectedSchema={setSelectedSchema} 
                selectedTable={selectedTable} 
                setSelectedTable={setSelectedTable} 
            />
            <ReviewPage selectedSchema={selectedSchema} selectedTable={selectedTable} />
        </>
    );
}
