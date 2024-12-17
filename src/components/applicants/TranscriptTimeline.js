import React, { useState, useEffect, useRef } from "react";

const TranscriptTimeline = () => {
  const [transcriptData, setTranscriptData] = useState(null);
  const audioRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
    const [topics, setTopics] = useState(null)
  // Fetch transcript data from API
  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        const response = await fetch("/resume_parser/analyze-audio/",{
            method: "POST"
        }); // Replace with your API URL
        const data = await response.json();
        const parsedData = JSON.parse(data.result)
        console.log(parsedData)
        const extractedTopics = parsedData.results.topics.segments.map(segment => segment.topics.map(topic => topic.topic))
        console.log(extractedTopics)
        setTranscriptData(parsedData.results.channels[0].alternatives[0].words);
      } catch (error) {
        console.error("Error fetching transcript data:", error);
      }
    };

    fetchTranscript();
  }, []);

  // Update the current time of the audio
  useEffect(() => {
    const audioElement = audioRef.current;

    const updateCurrentTime = () => {
      setCurrentTime(audioElement.currentTime);
    };

    if (audioElement) {
      audioElement.addEventListener("timeupdate", updateCurrentTime);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener("timeupdate", updateCurrentTime);
      }
    };
  }, []);

  const highlightWord = (start, end) => {
    return currentTime >= start && currentTime <= end;
  };

  return (
    <div className="w-full p-3">
      {/* <h1>Transcript Timeline</h1> */}
      <audio
      className="w-full h-8"
        ref={audioRef}
        controls
        src="https://candidhr-bucket.s3.amazonaws.com/audio_responses/Ravi%20Agrawal-ResumeScreening-19_a1e87_rs.wav?AWSAccessKeyId=AKIAQO5H23OLTTXCSUIS&Signature=n5SwxzwBZFuppgO2TtirERH4umo%3D&Expires=1732092106" // Replace with your audio source
      ></audio>
      <div style={{ marginTop: "20px" }} className="w-full">
        {transcriptData ? (
          <div className="transcript flex flex-wrap overflow-auto w-full text-sm">
            {transcriptData.map((wordObj, index) => (
              <label
                key={index}
                className={`px-1 rounded-lg  ${ highlightWord(
                    wordObj.start,
                    wordObj.end
                  )
                    ? "bg-blue-600 text-white"
                    : "bg-transparent text-gray-600"}`}
                style={{
                //   backgroundColor: highlightWord(
                //     wordObj.start,
                //     wordObj.end
                //   )
                //     ? "#ade8f4"
                //     : "transparent",
                }}
              >
                {wordObj.punctuated_word}
              </label>
            ))}
          </div>
        ) : (
          <p>Loading transcript...</p>
        )}
      </div>
    </div>
  );
};

export default TranscriptTimeline;
