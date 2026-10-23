'use client'
import { useRef, useState } from 'react';
import { Card, Stack, CardMedia, Grid, IconButton, Typography } from '@mui/material';
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
    <Card elevation={0} sx={{ width: 40, height:45, position: 'relative' }}>
      <CardMedia
        component="div"
        image={img}
        sx={{
          height: 45,
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
            width: 20,
            height: 20,
          }}
        >
          {isPlaying ? (
            <PauseIcon sx={{ fontSize: 10, color: 'secondary.main' }} />
          ) : (
            <PlayArrowIcon sx={{ fontSize: 10, color: 'secondary.main' }} />
          )}
        </IconButton>
      </CardMedia>
    </Card>
  );
}
