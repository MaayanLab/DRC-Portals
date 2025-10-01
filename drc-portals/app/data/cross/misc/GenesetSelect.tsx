import { Button, Checkbox, List, ListItem, ListItemButton, ListItemIcon, ListItemText, ListSubheader, Stack } from "@mui/material";
import { Gene, GeneSet } from ".prisma/client/gsc";

const scrollbarStyles = {
    'webkitAppearance': 'none',
    'width': '10px'
};

const scrollbarThumb = {
    'borderRadius': '5px',
    'backgroundColor': 'rgba(0,0,0,.5)',
    'WebkitBoxShadow': '0 0 1px rgba(255,255,255,.5)'
}

export function GeneSetSelect({ sessionInfo, checked, setChecked, selectedSets}: {
    sessionInfo: {
        gene_sets: ({
            genes: Gene[];
        } & GeneSet)[];
    } | null,
    checked: number[],
    setChecked: React.Dispatch<React.SetStateAction<number[]>>
    selectedSets: ({
        genes: Gene[];
    } & GeneSet)[],
}) {


    const handleToggle = (value: number) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }
        setChecked(newChecked);
    };

    const legendIds = selectedSets.map((item) => item.id)
    return (
        <List sx={{
            maxWidth: '100%', bgcolor: 'background.paper', overflow: 'scroll', borderRadius: 2, minHeight: 400, maxHeight: 350, boxShadow: 2, '&::-webkit-scrollbar': { ...scrollbarStyles },
            '&::-webkit-scrollbar-thumb': { ...scrollbarThumb }
        }}
        disablePadding>
            <ListSubheader className="border-b-2">
                Selected Gene Sets ({checked.length})
                <Stack direction='row' sx={{justifyContent:'center'}}>
                    <Button color='secondary' onClick={() => setChecked(sessionInfo ? sessionInfo.gene_sets.map((geneset, i) => i) : [])}>Select All</Button>
                    <Button color='secondary' onClick={() => setChecked([])}>Deselect All</Button>
                </Stack>
            </ListSubheader>

            {sessionInfo?.gene_sets.map((geneset, i) => {
                const labelId = `checkbox-list-label-${i}`;
                if (legendIds.includes(geneset.id)) {
                    return (
                        <ListItem
                            key={i}
                            disablePadding
                            sx={{
                                whiteSpace: 'normal !important',
                                wordWrap: 'break-word !important',
                            }}
                        >
                            <ListItemButton
                                onClick={handleToggle(i)}
                                dense>
                                <ListItemIcon>
                                    <Checkbox
                                        edge="start"
                                        checked={checked.indexOf(i) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{ 'aria-labelledby': labelId }}
                                    />
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={geneset.name} primaryTypographyProps={{ fontSize: 14 }} />
                            </ListItemButton>
                        </ListItem>
                    );
                }
                return (
                    <ListItem
                        key={i}
                        disablePadding
                        sx={{
                            whiteSpace: 'normal !important',
                            wordWrap: 'break-word !important',
                        }}
                    >
                        <ListItemButton
                            onClick={handleToggle(i)}
                            dense
                        // disabled={(isHumanGenes && !geneset.isHumanGenes) || (!isHumanGenes && geneset.isHumanGenes)}
                        >
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={checked.indexOf(i) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{ 'aria-labelledby': labelId }}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={geneset.name} primaryTypographyProps={{ fontSize: 14 }} />
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    )
}