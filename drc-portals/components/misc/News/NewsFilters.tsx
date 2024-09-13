import React, { useEffect } from 'react';
import { Box, FormControlLabel, Checkbox, FormGroup, Grid, Typography, Button } from '@mui/material';
import { filterOptions } from './FilterOptions';

type SelectedTagsType = {
    [K in keyof typeof filterOptions.tags]?: string[];
  };
const NewsFilter = ({
    selectedPortals,
    setSelectedPortals,
    selectedTags,
    setSelectedTags
}: {
    selectedPortals: string[],
    setSelectedPortals: (portals: string[]) => void,
    selectedTags: SelectedTagsType,
    setSelectedTags: (tags: SelectedTagsType) => void
}) => {
    const handlePortalChange = (event: React.ChangeEvent<HTMLInputElement>, portal: keyof typeof filterOptions.tags) => {
        const updatedPortals = event.target.checked
            ? [...selectedPortals, portal]
            : selectedPortals.filter(p => p !== portal);
        setSelectedPortals(updatedPortals);
    
        if (event.target.checked) {
            setSelectedTags({
                ...selectedTags,
                [portal]: filterOptions.tags[portal],
            });
        } else {
            const updatedTags = { ...selectedTags };
            delete updatedTags[portal];
            setSelectedTags(updatedTags);
        }
    };

    const handleTagChange = (event: React.ChangeEvent<HTMLInputElement>, portal: keyof typeof filterOptions.tags, tag: string) => {
        const updatedTags = { ...selectedTags };
        if (!updatedTags[portal]) {
            updatedTags[portal] = [];
        }
        if (event.target.checked) {
            updatedTags[portal] = [...(updatedTags[portal] || []), tag];
        } else {
            updatedTags[portal] = updatedTags[portal]?.filter(t => t !== tag);
        }
        setSelectedTags(updatedTags);

        const updatedPortals = new Set(selectedPortals);
        if (event.target.checked) {
            updatedPortals.add(portal);
        } else if (updatedTags[portal]?.length === 0) {
            updatedPortals.delete(portal);
        }
        setSelectedPortals(Array.from(updatedPortals));
    };

    const handleSelectAll = () => {
        const allPortals = filterOptions.portals;
        const allTags = Object.fromEntries(
            Object.entries(filterOptions.tags).map(([portal, tags]) => [portal, [...tags]])
        ) as SelectedTagsType;

        setSelectedPortals(allPortals);
        setSelectedTags(allTags);
    };

    const handleDeselectAll = () => {
        setSelectedPortals([]);
        setSelectedTags({});
    };

    useEffect(() => {
        handleSelectAll();
    }, []);

    return (
        <Box sx={{ marginLeft: 5, marginRight: 5, padding: 2, border: "solid 1px #ededed", borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 0 }}>
            <Button
                onClick={handleSelectAll}
                sx={{
                    borderRadius: 1,
                    backgroundColor: '#C3E1E6',
                    color: '#2D5986',
                    fontSize: '0.75rem',
                    '&:hover': {
                        backgroundColor: '#9cbcde'
                    }
                }}
            >
                Select All
            </Button>
            <Button
                onClick={handleDeselectAll}
                sx={{
                    borderRadius: 1,
                    marginLeft: 1,
                    backgroundColor: '#e6c8c3',
                    color: '#865a2d',
                    fontSize: '0.75rem',
                    '&:hover': {
                        backgroundColor: '#dfb8b1'
                    }
                }}
            >
                Deselect All
            </Button>
        </Box>
        <Grid container spacing={2}>
            {filterOptions.portals.map((portal, index) => (
                <React.Fragment key={index}>
                    <Grid item xs={3}>
                        <Box sx={{ paddingBottom: 1 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedPortals.includes(portal)}
                                        onChange={(e) => handlePortalChange(e, portal as keyof typeof filterOptions.tags)}
                                    />
                                }
                                label={<Typography variant="h6">{portal}</Typography>}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={9}>
                        <Box sx={{ paddingBottom: 1, display: 'flex', flexWrap: 'wrap' }}>
                            <FormGroup sx={{ display: 'flex', flexDirection: 'row' }}>
                                {filterOptions.tags[portal as keyof typeof filterOptions.tags]?.map((tag, idx) => (
                                    <FormControlLabel
                                        key={idx}
                                        control={
                                            <Checkbox
                                                checked={(selectedTags[portal as keyof typeof filterOptions.tags] || []).includes(tag)}
                                                onChange={(e) => handleTagChange(e, portal as keyof typeof filterOptions.tags, tag)}
                                            />
                                        }
                                        label={<Typography variant="body2">{tag}</Typography>}
                                        sx={{}}
                                    />
                                ))}
                            </FormGroup>
                        </Box>
                    </Grid>
                </React.Fragment>
            ))}
        </Grid>
    </Box>
    );
};

export default NewsFilter;