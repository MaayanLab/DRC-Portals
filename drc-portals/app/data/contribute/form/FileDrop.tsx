"use client"
import * as React from 'react';
import { useEffect } from 'react';
import Box, { BoxProps } from '@mui/system/Box';
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl';
import styled from '@mui/material/styles/styled';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import { GoFileZip } from "react-icons/go";
import DeleteIcon from '@mui/icons-material/Delete';

// TODO: just inherit theme from root?
function Item(props: BoxProps) {
  const { sx, ...other } = props;
  return (
    <Box
      sx={{
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#101010' : '#fff'),
        color: (theme) => (theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800'),
        p: 1,
        m: 1,
        fontSize: '0.875rem',
        fontWeight: '700',
        ...sx,
      }}
      {...other}
    />
  );
}

const Demo = styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
}));

function FileList(prop: {file:string}) {
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

  return (<Grid>
    <Typography style={{display: 'inline-block'}} variant="body2" component="span">
          File to Upload
      </Typography>

      <Demo>
          {fileUploaded && <List dense={dense}>
              <ListItem
                  secondaryAction={
                      <IconButton edge="end" aria-label="delete">
                          {/* <DeleteIcon /> */}
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
                      primaryTypographyProps={{fontSize: '15px'}} 
                      
                  />
              </ListItem>
          </List>}
      </Demo>
  </Grid>);

}

export function FileDrop({ name }: { name: string }) {
  const [isOver, setIsOver] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const renderedFile = React.useMemo(() => file?.name ?? '', [file])

  const commonStyles = {
    bgcolor: 'background.paper',
    borderColor: 'text.primary',
    m: 1,
    border: 1,
    width: '30rem',
    height: '10rem',
    backgroundColor: isOver ? 'lightgray' : 'white',
  };

  return (
    <>
      <Item>
        <Box
          sx={{ ...commonStyles, borderRadius: 1,
            position: 'relative', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div>
            <Typography variant="h6" className='text-center align-center'> Drag and drop zipped file here </Typography>
            <div className='flex justify-center'>
            <GoFileZip size={70}/>
            </div>
           
          </div>
          <input
            id="raised-button-file"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: '100%',
              cursor: 'pointer',
              opacity: 0,
            }}
            onDragOver={() => {setIsOver(true)}}
            onDragLeave={() => {setIsOver(false)}}
            onDrop={() => {setIsOver(false)}}
            type="file"
            accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed"
            name={name}
            onChange={evt => {setFile(evt.target?.files ? evt.target.files[0] : null)}}
          />
        </Box>
      </Item>
      <Item>
        <FormControl>
          <label htmlFor="raised-button-file">
            <Button variant="contained" color="primary" component="span">
              Choose File
            </Button>
          </label>
        </FormControl>
      </Item>
      <Item>
        <FileList file={renderedFile} />
      </Item>
    </>
  );
}
