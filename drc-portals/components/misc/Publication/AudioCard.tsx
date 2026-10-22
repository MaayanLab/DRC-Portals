'use client'
import { useRef, useState } from 'react';
import { Card, CardContent, CardMedia, Grid, IconButton, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

export default function AudioCard({img, audio}: {img: string, audio: string}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
	if (audioRef.current) {
		if (isPlaying) {
		audioRef.current.pause();
		} else {
		audioRef.current.play();
		}
	}
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <Card sx={{ maxWidth: 280, position: 'relative' }}>
      <CardContent>
        <Grid container spacing={1}>
          <Grid item xs={7}>
              <Typography variant={'caption'}>Listen to an engaging AI-generated podcast about this publication.</Typography>
          </Grid>
          <Grid item xs={5}>
              <CardMedia
                component="div"
                image={img}
                sx={{
                  height: 80,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <audio
                  ref={audioRef}
                  src={audio}
                  onEnded={handleAudioEnded}
                />

                <IconButton
                  onClick={togglePlay}
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    },
                    width: 40,
                    height: 40,
                  }}
                >
                  {isPlaying ? (
                    <PauseIcon sx={{ fontSize: 30, color: 'secondary.main' }} />
                  ) : (
                    <PlayArrowIcon sx={{ fontSize: 30, color: 'secondary.main' }} />
                  )}
                </IconButton>
              </CardMedia>
          </Grid>
        </Grid>
      </CardContent>
      
    </Card>
  );
}
