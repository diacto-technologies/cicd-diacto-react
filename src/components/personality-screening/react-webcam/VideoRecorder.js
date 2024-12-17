// import React, { useState, useRef } from "react";
// import Webcam from "react-webcam";

// const VideoRecorder = () => {
//   const [uploadId, setUploadId] = useState(null);
//   const [partNumber, setPartNumber] = useState(1);
//   const [isRecording, setIsRecording] = useState(false);
//   const webcamRef = useRef(null);
//   const mediaRecorderRef = useRef(null);
//   const [chunks, setChunks] = useState([]);
//   const [uploadedParts, setUploadedParts] = useState([]);  // Stores parts with ETags


//   const videoRecorderRef = useRef(null);
//     const audioRecorderRef = useRef(null);
//     const [capturing, setCapturing] = useState(false);
//     const [videoChunks, setVideoChunks] = useState([]);
//     const [audioChunks, setAudioChunks] = useState([]);

//   const initializeMediaRecorders = () => {
//     if (webcamRef.current && webcamRef.current.stream) {
//       const videoStream = new MediaStream(webcamRef.current.stream.getVideoTracks());
//       const audioStream = new MediaStream(webcamRef.current.stream.getAudioTracks());

//       videoRecorderRef.current = new MediaRecorder(videoStream, { mimeType: "video/webm" });
//       audioRecorderRef.current = new MediaRecorder(audioStream, { mimeType: "audio/webm" });

//       videoRecorderRef.current.addEventListener("dataavailable", handleVideoDataAvailable);
//       audioRecorderRef.current.addEventListener("dataavailable", handleAudioDataAvailable);
//     }
//   };

//   const handleStartRecording = () => {
//     setIsRecording(true);
//     setChunks([]);
//     setUploadedParts([]); // Reset uploaded parts
//     const options = { mimeType: "video/webm" };
//     const mediaRecorder = new MediaRecorder(webcamRef.current.stream, options);
//     mediaRecorderRef.current = mediaRecorder;

//     mediaRecorder.ondataavailable = (event) => {
//       if (event.data.size > 0) {
//         setChunks((prevChunks) => [...prevChunks, event.data]);
//       }
//     };

//     mediaRecorder.start(1000); // Send chunk every second
//   };

//   const handleStopRecording = async () => {
//     setIsRecording(false);
//     mediaRecorderRef.current.stop();
//     await uploadChunks();
//   };

//   const uploadChunks = async () => {
//     for (let i = 0; i < chunks.length; i++) {
//       const chunk = chunks[i];
//       const formData = new FormData();
//       formData.append("file", chunk);
//       formData.append("video_id", "unique-video-id");
//       formData.append("part_number", partNumber);

//       if (uploadId) {
//         formData.append("upload_id", uploadId);
//       }

//       const response = await fetch("/video_upload/upload-chunk/", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
//       if (data.upload_id && !uploadId) {
//         setUploadId(data.upload_id); // Save the upload_id for further chunks
//       }

//       // Track the uploaded part
//       setUploadedParts((prevParts) => [
//         ...prevParts,
//         { PartNumber: partNumber, ETag: data.etag },
//       ]);

//       // Increment part number
//       setPartNumber((prev) => prev + 1);
//     }

//     await completeUpload();
//   };

//   const completeUpload = async () => {
//     const response = await fetch("/video_upload/complete-upload/", {
//       method: "PUT",
//       body: JSON.stringify({
//         video_id: "unique-video-id",
//         upload_id: uploadId,
//         parts: uploadedParts, // Send all the uploaded parts to complete
//       }),
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });

//     const data = await response.json();
//     console.log("Upload complete: ", data);
//   };

//   return (
//     <div>
//       <Webcam ref={webcamRef} audio onUserMedia={initializeMediaRecorders} />
//       {isRecording ? (
//         <button onClick={handleStopRecording}>Stop Recording</button>
//       ) : (
//         <button onClick={handleStartRecording}>Start Recording</button>
//       )}
//     </div>
//   );
// };

// export default VideoRecorder;
