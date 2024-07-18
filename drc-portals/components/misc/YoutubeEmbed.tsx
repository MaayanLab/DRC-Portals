import React from "react";

const YoutubeEmbed = ({ embedId }: {embedId: string}) => (
  <div className="video-responsive">
    <iframe
      width="430"
      height="240"
      src={`https://www.youtube.com/embed/${embedId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Embedded youtube"
    />
  </div>
);


export default YoutubeEmbed;
