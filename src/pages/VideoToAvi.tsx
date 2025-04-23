import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { useState, useRef } from 'react';

function VideoToAvi() {
  const [loaded, setLoaded] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);

  const load = async () => {
    try {
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on('log', ({ message }) => {
          if (messageRef.current) {
            messageRef.current.textContent = message;
          }
          console.log(message);
      });
      // toBlobURL is used to bypass CORS issue, urls with the same
      // domain can be used directly.
      console.log("loading ffmpeg");
      await ffmpeg.load({
          coreURL: await toBlobURL(`https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm`, 'application/wasm'),
      });
      console.log("loaded ffmpeg");
      setLoaded(true);
    } catch (error) {
      console.error("error loading ffmpeg", error);
    }
  }

  const transcode = async () => {
      const ffmpeg = ffmpegRef.current;
      await ffmpeg.writeFile('input.webm', await fetchFile('https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm'));
      await ffmpeg.exec(['-i', 'input.webm', 'output.mp4']);
      const data = await ffmpeg.readFile('output.mp4');
      if (videoRef.current) {
        videoRef.current.src =
            URL.createObjectURL(new Blob([data instanceof Uint8Array ? data : new Uint8Array(0)], {type: 'video/mp4'}));
      }
  }

  return (loaded
      ? (
          <>
          <h1>This is just a test page to try some things out with ffmpeg</h1>
              <video ref={videoRef} controls></video><br/>
              <button onClick={transcode}>Transcode webm to mp4</button>
              <p ref={messageRef}></p>
              <p>Open Developer Tools (Ctrl+Shift+I) to View Logs</p>
          </>
      )
      : (
          <button onClick={load}>Load ffmpeg-core (~31 MB)</button>
      )
  );
}

export default VideoToAvi;