"use client"

import React from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

export default function YoutubeVideo() {
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
  }

  const opts: YouTubeProps['opts'] = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 1,
    },
  };
  return <YouTube videoId="VxYmfJbA_lU" opts={opts} onReady={onPlayerReady}/>;
}