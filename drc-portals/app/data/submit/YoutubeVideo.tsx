"use client"

import React from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

export default function YoutubeVideo({size}: {size: 'large' | 'small'}) {
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    // access to player in all event handlers via event.target
    event.target.pauseVideo();
  }

  const opts: YouTubeProps['opts'] = {
    height: size === 'large' ? '390': '156',
    width: size === 'large' ? '640': '256',
    playerVars: {
      autoplay: 1,
    },
  };
  return <YouTube videoId="VxYmfJbA_lU" opts={opts} onReady={onPlayerReady}/>;
}