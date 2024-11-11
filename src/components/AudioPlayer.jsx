import { useDeferredValue, useEffect, useRef, useState } from "react";
// import Spectrogram from "wavesurfer.js/dist/plugins/spectrogram.esm.js";
import Spectrogram from "../utils/spectrogram";
import createColormap from "colormap";
import WaveSurfer from "wavesurfer.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlassPlus,
  faPause,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { faMagnifyingGlassMinus } from "@fortawesome/free-solid-svg-icons";

const zoomedInMinPxPerSec = 50;

function AudioPlayer({
  audioUrl,
  fftSamples = 4096,
  frequencyMin = 0,
  frequencyMax = 8000,
  audioVisualisation = "",
  progressColor,
}) {
  const containerRef = useRef(null);
  const [wavesurfer, setWavesurfer] = useState(null);
  const [initialised, setInitialised] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [zoomed, setZoomed] = useState(true);
  const deferredZoomed = useDeferredValue(zoomed);
  const withSpectrogram = audioVisualisation === "spectrogram";

  useEffect(() => {
    if (!containerRef.current) return;

    const plugins = [];

    if (withSpectrogram) {
      plugins.push(
        Spectrogram.create({
          labels: true,
          height: 200,
          splitChannels: false,
          fftSamples,
          frequencyMin,
          frequencyMax,
          labelsBackground: "rgba(0,0,0,0.5)",
          colorMap: createColormap({
            colormap: "magma",
            nshades: 256,
            format: "float",
          }),
        })
      );
    }

    const ws = WaveSurfer.create({
      container: containerRef.current,
      height: withSpectrogram ? 0 : 100,
      url: audioUrl,
      normalize: true,
      barWidth: 2,
      barGap: 2,
      barRadius: 30,
      // mediaControls: true,
      minPxPerSec: zoomedInMinPxPerSec,
      sampleRate: 88200, // Seems we can make this as high as we want for spectrogram purposes. If it is too low, then the upper range of the spectrogram may be missing.
      cursorColor: "#FFFFFF",
      progressColor,
      plugins,
    });

    setWavesurfer(ws);

    const unsubscribe = [
      ws.on("init", () => {
        setInitialised(true);
      }),
      ws.on("play", () => {
        setPlaying(true);
      }),
      ws.on("pause", () => {
        setPlaying(false);
      }),
    ];

    return () => {
      setInitialised(false);
      unsubscribe.forEach((fn) => fn());
      ws.destroy();
    };
  }, [
    audioUrl,
    containerRef,
    fftSamples,
    frequencyMax,
    frequencyMin,
    progressColor,
    withSpectrogram,
  ]);

  useEffect(() => {
    if (!(wavesurfer?.options && initialised)) return;
    const isZoomed = wavesurfer.options.minPxPerSec === zoomedInMinPxPerSec;
    if (isZoomed !== deferredZoomed) {
      wavesurfer.zoom(deferredZoomed ? zoomedInMinPxPerSec : 1);
    }
  }, [deferredZoomed, initialised, wavesurfer]);

  return (
    <div
      className={`ss_AudioPlayer${
        withSpectrogram ? " ss_withSpectrogram" : ""
      }`}
    >
      <div className="ss_playerContainer">
        <div className="ss_player" ref={containerRef} />
      </div>
      <div className="ss_controls">
        <button onClick={() => wavesurfer.playPause()}>
          <span className="ss_iconLeft">
            <FontAwesomeIcon icon={playing ? faPause : faPlay} />
          </span>
          {playing ? "Pause" : "Play"}
        </button>
        <button onClick={() => setZoomed(!zoomed)}>
          <span className="ss_iconLeft">
            <FontAwesomeIcon
              icon={zoomed ? faMagnifyingGlassMinus : faMagnifyingGlassPlus}
            />
          </span>
          Zoom {zoomed ? "Out" : "In"}
        </button>
      </div>
    </div>
  );
}

export default AudioPlayer;
