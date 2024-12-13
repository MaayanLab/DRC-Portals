import React from 'react';
import { Box, FormControlLabel, Checkbox, FormGroup } from '@mui/material';

interface KeywordsFilterProps {
    isDccSelected: boolean;
    setIsDccSelected: (selected: boolean) => void;
    isR03Selected: boolean;
    setIsR03Selected: (selected: boolean) => void;
    isCenterSelected: boolean;
    setIsCenterSelected: (selected: boolean) => void;
    isLandmarkSelected: boolean;
    setIsLandmarkSelected: (selected: boolean) => void;

}

const Filters = ({
    isDccSelected,
    setIsDccSelected,
    isR03Selected,
    setIsR03Selected,
    isCenterSelected,
    setIsCenterSelected,
    isLandmarkSelected,
    setIsLandmarkSelected
}: KeywordsFilterProps) => {
    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                {/* Center Filter*/}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isCenterSelected}
                            onChange={(e) => setIsCenterSelected(e.target.checked)}
                            size="small"
                        />
                    }
                    label="Centers"
                    sx={{ mr: 2 }}
                />
                {/* DCC Filter */}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isDccSelected}
                            onChange={(e) => setIsDccSelected(e.target.checked)}
                            size="small"
                        />
                    }
                    label="DCCs"
                    sx={{ mr: 2 }}
                />
                {/* Landmark Filter */}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isLandmarkSelected}
                            onChange={(e) => setIsLandmarkSelected(e.target.checked)}
                            size="small"
                        />
                    }
                    label="Landmark"
                    sx={{ mr: 2 }}
                />
                {/* R03 Filter */}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isR03Selected}
                            onChange={(e) => setIsR03Selected(e.target.checked)}
                            size="small"
                        />
                    }
                    label="R03s"
                    sx={{ mr: 2 }}
                />
            </FormGroup>
        </Box>
    );
};

export default Filters;