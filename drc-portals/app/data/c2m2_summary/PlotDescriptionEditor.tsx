// PlotDescriptionEditor.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, TextField } from '@mui/material';

interface PlotDescriptionEditorProps {
  initialValue: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  error?: boolean;
  helperText?: string;
}

const PlotDescriptionEditor: React.FC<PlotDescriptionEditorProps> = ({
  initialValue,
  onSave,
  onCancel,
  error,
  helperText
}) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue); // In case initialValue changes externally
  }, [initialValue]);

  return (
    <Box sx={{ mt: 3 }}>
      <TextField
        label="Edit Plot Description"
        multiline
        fullWidth
        minRows={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        error={error}
        helperText={helperText || 'Enter the description for the chart.'}
        placeholder="Please enter the plot description here."
      />
      <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={() => onSave(value)}>
          Save
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default React.memo(PlotDescriptionEditor);
