"use client"
import * as React from 'react';
import { styled } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect } from 'react';

function generate(element: React.ReactElement) {
    return [0, 1, 2].map((value) =>
        React.cloneElement(element, {
            key: value,
        }),
    );
}

const Demo = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
}));



export default function FileList(prop: {file:string}) {
    const [dense, setDense] = React.useState(false);
    const [secondary, setSecondary] = React.useState(false);
    const [fileUploaded, setFileUploaded] = React.useState<boolean>(false);

    useEffect(() => {
       if (prop.file != '') {
        setFileUploaded(true)
       } else {
        setFileUploaded(false)
       }
    }, [prop.file]);

    
    return (<Grid item xs={12} md={6}>
        <Typography sx={{ mt: 4, mb: 2 }} variant="h6" component="div">
            Files to Upload
        </Typography>
        <Demo>
            {fileUploaded && <List dense={dense}>
                <ListItem
                    secondaryAction={
                        <IconButton edge="end" aria-label="delete">
                            <DeleteIcon />
                        </IconButton>
                    }
                >
                    <ListItemAvatar>
                        <Avatar>
                            <FolderIcon />
                        </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                        primary= {prop.file.toString()}
                        secondary={secondary ? 'Secondary text' : null}
                    />
                </ListItem>
            </List>}
        </Demo>
    </Grid>);

}