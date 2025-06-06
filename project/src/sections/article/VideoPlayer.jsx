import React, { useRef, useEffect } from 'react';
import { useInView } from '../hooks/useInView';

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const [containerRef, inView] = useInView({ threshold: 0.5 });

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (inView) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, [inView]);

  return (
    <div ref={containerRef} className="mt-4 flex justify-center">
      <video
        ref={videoRef}
        muted
        playsInline
        loop
        className="max-h-96 rounded-lg border border-gray-700"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
