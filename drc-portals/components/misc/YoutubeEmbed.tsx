import React from "react";


const aspectRatio = 9/16;
const YoutubeEmbed = ({ embedId, widthPercentage = 80  }: {embedId: string, widthPercentage?: number}) => (

  // <div className="video-responsive">
  <div style={{ 
    width: `${widthPercentage}%`,
    margin: '0 auto', // Centers the container
    position: 'relative',
    paddingTop: `${widthPercentage * aspectRatio}%`, // Maintains aspect ratio
  }}>
    <iframe
      // width="430"
      // height="240"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 0,
      }}
      src={`https://www.youtube.com/embed/${embedId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Embedded youtube"
    />
  </div>
);


export default YoutubeEmbed;
