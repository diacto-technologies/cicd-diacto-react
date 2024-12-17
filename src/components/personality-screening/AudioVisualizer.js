import React, { useEffect, useRef, useState } from 'react';
import { AudioVisualizer } from 'react-audio-visualize';

const Visualizer = ({analyser}) => {
//   const [blob, setBlob] = useState(audio);
  const visualizerRef = useRef(null)
  

  

  return (
    <div>
      {analyser && (
        <AudioVisualizer
          ref={visualizerRef}
             
          width={500}
          height={75}
          barWidth={1}
          gap={0}
          barColor={'#f76565'}
        />
      )}
    </div>
  )
}

export default Visualizer;