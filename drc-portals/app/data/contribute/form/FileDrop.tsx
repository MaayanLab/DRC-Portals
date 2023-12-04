"use client"
import * as React from 'react';
import { useEffect } from 'react';
import Box, { BoxProps } from '@mui/system/Box';
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FolderIcon from '@mui/icons-material/Folder';
import { MdUploadFile } from "react-icons/md";
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



function FileList(prop: { files: string[], setFile: React.Dispatch<React.SetStateAction<FileList | []>>, fileObjects: FileList | [] }) {
  const [dense, setDense] = React.useState(false);
  const [secondary, setSecondary] = React.useState(false);
  const [fileUploaded, setFileUploaded] = React.useState<boolean>(false);

  function handleDelete(index: number, fileObjects: FileList | [], setFile: React.Dispatch<React.SetStateAction<FileList | []>>) {
    if (fileObjects.length > 0) {
      const fileObjectArray = Array.from(fileObjects)
      const newFileList = fileObjectArray.filter(file => file.name != fileObjectArray[index].name);
      setFile(arrayToFileList(newFileList))
    }
  }

  useEffect(() => {
    if (prop.files.length > 0) {
      setFileUploaded(true)
    } else {
      setFileUploaded(false)
    }
  }, [prop.files]);

  return (<Grid>
    <Typography style={{ display: 'inline-block' }} variant="body2" component="span">
      Files to Upload
    </Typography>

    {fileUploaded && <List dense={dense}>
      {prop.files.map((file, index) => (
        <ListItem key={index}
          secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => { handleDelete(index, prop.fileObjects, prop.setFile) }}>
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
            primary={file.toString()}
            secondary={secondary ? 'Secondary text' : null}
            primaryTypographyProps={{ fontSize: '15px' }}
          />

        </ListItem>)
      )}
    </List>}
  </Grid>);

}

export function arrayToFileList(arrayOfFiles: File[]) {
  const dataTransfer = new DataTransfer();
  arrayOfFiles.forEach((file) => {
    dataTransfer.items.add(file);
  });
  return dataTransfer.files;
}


export function FileDrop({ name, setUploadedFiles }: { name: string, setUploadedFiles: React.Dispatch<React.SetStateAction<FileList | []>> }) {
  const [isOver, setIsOver] = React.useState(false);
  const [files, setFile] = React.useState<FileList | []>([]);
  const renderedFile = React.useMemo(() => files != null ? Array.from(files).map((file: File) => { return file.name }) : [], [files])

  React.useEffect(()=> {
    setUploadedFiles(files)
  }, [files])

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
          sx={{
            ...commonStyles, borderRadius: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div>
            <Typography variant="h6" className='text-center align-center'> Drag and drop files here </Typography>
            <div className='flex justify-center'>
              <MdUploadFile size={70} />
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
            onDragOver={() => { setIsOver(true) }}
            onDragLeave={() => { setIsOver(false) }}
            onDrop={() => { setIsOver(false) }}
            type="file"
            multiple
            name={name}
            onChange={evt => {
              const oldFileList = files
              if (evt.target.files != null) {
                const newFileList = Array.from(oldFileList).concat(...Array.from(evt.target.files))
                setFile(arrayToFileList(newFileList))
              }
            }}
          />
        </Box>
      </Item>
      <Item>
        <FormControl>
          <label htmlFor="raised-button-file">
            <Button variant="contained" color="primary" component="span">
              Choose Files
            </Button>
          </label>
        </FormControl>
      </Item>
      <Item>
        <FileList files={renderedFile} setFile={setFile} fileObjects={files} />
      </Item>
    </>
  );
}
