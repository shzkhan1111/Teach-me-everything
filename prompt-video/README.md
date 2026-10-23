# Frame — Prompt Video Studio

## Narrated LCM lesson

Play `LCM-lesson-with-voice.mp4`, or choose **LCM lesson with voice** in the studio. This 54-second version has spoken Microsoft Zira narration, with the visuals and answer reveal timed to the speech. The general scene exporter remains silent.

Rebuild narration on Windows with `narrate-lcm.ps1`, then run `voice-video.py` using Python with the project-local `.video-tools/imageio_ffmpeg` dependency. Speech is synthesized locally; no prompts or audio are uploaded.

A standalone local app that creates silent illustrated videos from prompts. No packages to install, accounts, API keys or network requests.

## Use

Open `index.html` in a recent Chrome or Edge browser. Or, with Node.js installed, run `npm start` in this folder and open http://127.0.0.1:4173.

1. Enter your prompt. Sentences become caption cards.
2. Choose a scene, colour mood, duration, and orientation.
3. Click **Create preview**.
4. Click **Export video** and keep the tab visible while it records.
5. Play the result and click **Download your video**.

Export is normally WebM (VP9 or VP8), with MP4 used only if the browser supports it. Recording takes the chosen video duration. Landscape is 1280×720, portrait 720×1280, square 960×960, at a target of 30 fps. Actual frame rate depends on device performance.

## What prompts control

## LCM teaching video

Open the studio and click **Watch the LCM lesson** to play a 36-second explanation with animated multiples, a worked example and a practice question. The ready-to-watch `LCM-lesson.webm` uses this same lesson renderer. It is silent, with all teaching shown on screen. LCM prompts in automatic scene mode also select this lesson. This lesson uses a fixed landscape layout and duration.

To reproduce the supplied video without a browser: run `node capture-lesson.cjs`, then run `render-lesson.py` with a Python environment that has Pillow and WebP support. No external video encoder is needed.

## General prompt scenes

This is a procedural animation app, not an AI model. Keywords choose one of four illustrated scenes: space, mountains, ocean, or city. They also choose a colour mood. Prompt text seeds visual variations and appears as captions. It does not generate arbitrary objects or photorealistic footage. Long captions may be truncated to fit. Videos contain no audio.

## Project files

- `index.html`: interface
- `style.css`: responsive styles
- `app.js`: prompt matching, canvas scenes, playback, and browser video recording
- `server.cjs`: optional local server, bound to this device only

All video processing happens in the browser. The app does not upload prompts or videos. Stop the optional server with Ctrl+C.
