import { use } from 'echarts';
import { useEffect, useRef, useState } from 'react';
// import Webcam from 'react-webcam';
import { v4 as uuidv4 } from 'uuid';

const WebcamRec = ({isRecording}) => {
  const webcamRef = useRef(null);
  const videoRecorderRef = useRef(null);
  const audioRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [videoChunks, setVideoChunks] = useState([]);
  const [audioChunks, setAudioChunks] = useState([]);
  const [mediaOn, setMediaOn] = useState(false)
  const [currentChunk,setCurrentChunk] = useState(null)
  // Replace useState with useRef
  // const videoIdRef = useRef(null);
  // const uploadIdRef = useRef(null);
  // const partNumberRef = useRef(1);
  // const uploadedPartsRef = useRef([]);

  const [videoId, setVideoId] = useState(null)
  const [uploadId, setUploadId] = useState(null);
  const [partNumber, setPartNumber] = useState(1);
  const [uploadedParts, setUploadedParts] = useState([]);

  useEffect(() => {
    console.log("isRecording",isRecording);

    if (isRecording && videoRecorderRef.current && audioRecorderRef.current) {
      handleStartCaptureClick();
    }
  }, [isRecording, videoRecorderRef.current]);

  useEffect(() => {
    console.log("called",videoChunks,partNumber,uploadId,uploadedParts)
    
    uploadChunk(currentChunk, 'video/webm',videoId,uploadId,partNumber,uploadedParts);

  },[videoChunks])

  const initializeMediaRecorders = () => {
    if (webcamRef.current && webcamRef.current.stream) {
      const videoStream = new MediaStream(webcamRef.current.stream.getVideoTracks());
      const audioStream = new MediaStream(webcamRef.current.stream.getAudioTracks());

      videoRecorderRef.current = new MediaRecorder(videoStream, { mimeType: "video/webm" });
      audioRecorderRef.current = new MediaRecorder(audioStream, { mimeType: "audio/webm" });

      videoRecorderRef.current.addEventListener("dataavailable", handleVideoDataAvailable);
      audioRecorderRef.current.addEventListener("dataavailable", handleAudioDataAvailable);
    }
  };

  const handleStartCaptureClick = (e) => {
    if (videoRecorderRef.current && audioRecorderRef.current) {
      e.preventDefault()
      const id = uuidv4();
      setVideoId(id)
      // uploadedPartsRef.current = []; // Reset uploaded parts
      // partNumberRef.current = 1; // Reset part number
      videoRecorderRef.current.start(30000);
      audioRecorderRef.current.start(30000);
    }
  };

  const handleStopCaptureClick = async () => {
    if (videoRecorderRef.current && audioRecorderRef.current) {
      videoRecorderRef.current.stop();
      audioRecorderRef.current.stop();
      setCapturing(false);
      // await completeUpload();
    }
  };

  const handleVideoDataAvailable = async ({ data }) => {
    if (data.size > 0) {
      setCapturing(false);
      setCurrentChunk(data)
      setVideoChunks((prev) => prev.concat(data));
    }
  };

  const handleAudioDataAvailable = async ({ data }) => {
    if (data.size > 0) {
      setAudioChunks((prev) => prev.concat(data));
      // await uploadChunk(data, 'audio/webm');
    }
  };

  const uploadChunk = async (chunk, type,videoId,uploadId,partNumber,uploadedParts) => {
    console.log("Before uploading chunk",type,videoId,uploadId,partNumber,uploadedParts);
    
    if (videoId) {
      
      
      const formData = new FormData();
      formData.append("file", chunk);
      formData.append("part_number", partNumber);
      formData.append("type", type);
      formData.append("video_id", videoId);
  
      if (uploadId) {
        formData.append("upload_id", uploadId);
      }
  
      const response = await fetch("/video_upload/upload-chunk/", {
        method: "POST",
        body: formData,
      });
  
      const data = await response.json();
    
      // Increment part number for the next chunk
      if (data.upload_id && !uploadId) {
        setUploadId(data.upload_id); // Save the upload_id for further chunks
      }
      console.log("data:",data)
       // Track the uploaded part
       setUploadedParts((prevParts) => [
        ...prevParts,
        { PartNumber: partNumber, ETag: data.etag },
      ]);

      // Increment part number
      setPartNumber((prev) => prev + 1);
      

    }
  };

 
  

  // const completeUpload = async () => {
  //   const response = await fetch("/video_upload/complete-upload/", {
  //     method: "PUT",
  //     body: JSON.stringify({
  //       upload_id: uploadIdRef.current,
  //       video_id: videoIdRef.current,
  //       parts: uploadedPartsRef.current,  // Send all uploaded parts
  //     }),
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });

  //   const data = await response.json();
  //   console.log("Upload complete: ", data);
  // };

  const handleDownload = (chunks, type) => {
    if (chunks.length) {
      const blob = new Blob(chunks, { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = type === "video/webm" ? "recorded_video.webm" : "recorded_audio.webm";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      {/* <Webcam audio={true} ref={webcamRef} onUserMedia={initializeMediaRecorders} /> */}
      {capturing ? (
        <button onClick={handleStopCaptureClick}>Stop Capture</button>
      ) : (
        <button onClick={(e) => handleStartCaptureClick(e)}>Start Capture</button>
      )}
      {videoChunks.length > 0 && (
        <button onClick={() => handleDownload(videoChunks, "video/webm")}>Download Video</button>
      )}
      {audioChunks.length > 0 && (
        <button onClick={() => handleDownload(audioChunks, "audio/webm")}>Download Audio</button>
      )}
    </div>
  );
};

export default WebcamRec;
