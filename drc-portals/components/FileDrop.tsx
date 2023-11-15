"use client"
import { DragEvent, SetStateAction, useEffect, useState } from 'react';
import { Box, BoxProps } from '@mui/system';
import { Button, FormControl, Typography } from '@mui/material';
import FileList from './FileList';

export function FileDrop({setFormFiles} : any) {
  const [isOver, setIsOver] = useState(false);
  const [file, setFile] = useState<File | null >(null);
  const [renderedFile, setRenderedFile] = useState<string>('');

  // Define the event handlers
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(false);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsOver(false);

    // Fetch the files
    const droppedFile = Array.from(event.dataTransfer.files)[0];
    setFile(droppedFile)
    setFormFiles(event.dataTransfer.files[0])
  };


  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.files != null) {
      setFile(event.target.files[0])
      setFormFiles(event.target.files[0])
    }
    }
   
  useEffect(() => {
    if (file != null) {
    const updatedRenderedEl =  file.name

    setRenderedFile(updatedRenderedEl);
  }
  }, [file]);

  const commonStyles = {
    bgcolor: 'background.paper',
    borderColor: 'text.primary',
    m: 1,
    border: 1,
    width: '30rem',
    height: '20rem',
    backgroundColor: isOver ? 'lightgray' : 'white',
  };

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

  return (
    <>
      <Item>
        <Box sx={{ ...commonStyles, borderRadius: 1 }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}>
          <div>
            <Typography variant="h6" className='text-center align-center'> Drag and drop files here </Typography>
          </div>
        </Box>
      </Item>
      <Item>
        <FormControl>
          <input
            style={{ display: 'none' }}
            id="raised-button-file"
            // multiple
            type="file"
            accept=".zip,.rar,.7zip"
            name='file'
            onChange={handleFileChange}
          />
          <label htmlFor="raised-button-file">
            <Button variant="contained" component="span">
              Choose Files
            </Button>
          </label>
        </FormControl>
      </Item>
      <Item>
        <FileList file ={renderedFile} />
        {/* {renderedFile} */}
      </Item>
    </>



  );
}
