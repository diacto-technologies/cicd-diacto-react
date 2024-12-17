import React, { useState, useRef } from "react";
import "./AudioPlayer.css"; // Optional: Add custom CSS styles
import { PauseIcon, PlayIcon } from "@heroicons/react/24/solid";

const AudioPlayer = ({ audioUrl }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Toggle play/pause
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false); // Update state after pause
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true)) // Update state after play succeeds
        .catch((error) => {
          console.error("Error playing audio:", error);
        });
    }
  };

  // Update time during playback
  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  // Update duration when metadata is loaded
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  // Seek audio to clicked position
  const handleProgressClick = (event) => {
    const progressBar = event.target;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Format time in mm:ss
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="audio-player">
      <div className="controls">
        <button className="play-pause-btn" onClick={togglePlayPause}>
          {isPlaying ? (
            <PauseIcon className="w-5 h-5 text-gray-700" />
          ) : (
            <PlayIcon className="w-5 h-5 text-gray-700" />
          )}
        </button>
        <span className="time">{formatTime(currentTime)}</span>
        <div className="progress-bar" onClick={handleProgressClick}>
          <div
            className="progress-bar-filled"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>
        <span className="time">{formatTime(duration)}</span>
      </div>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      ></audio>
    </div>
  );
};

export default AudioPlayer;
