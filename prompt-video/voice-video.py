"""Add locally synthesized speech to the studio's existing 36-second LCM video."""
from pathlib import Path
import subprocess
import sys
import wave

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / '.video-tools'))
import imageio_ffmpeg

ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
slots = [9, 9, 9, 9, 9, 6, 3]
inputs = ['-i', str(ROOT / 'LCM-lesson.webm')]
filters = ['[0:v]setpts=1.5*PTS[visual]']
for index, slot in enumerate(slots):
    filename = ROOT / f'lcm-voice-{index}.wav'
    with wave.open(str(filename), 'rb') as audio:
        duration = audio.getnframes() / audio.getframerate()
    # Leave a brief pause before each next visual. Never truncate spoken words.
    speed = max(1, duration / (slot - 0.25))
    inputs += ['-i', str(filename)]
    filters.append(f'[{index+1}:a]atempo={speed:.6f},apad=whole_dur={slot},atrim=duration={slot},asetpts=PTS-STARTPTS[a{index}]')
    print(f'Section {index+1}: {duration:.2f}s speech in {slot}s slot, speed {speed:.2f}x', flush=True)
filters.append(''.join(f'[a{i}]' for i in range(len(slots))) + 'concat=n=7:v=0:a=1[voice]')
output = ROOT / 'LCM-lesson-with-voice.mp4'
subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-y', *inputs,
    '-filter_complex', ';'.join(filters), '-map', '[visual]', '-map', '[voice]',
    '-c:v', 'libx264', '-preset', 'fast', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-movflags', '+faststart', '-t', '54',
    str(output)], check=True)
# Fully decode the finished artifact to detect broken packets or invalid media.
subprocess.run([ffmpeg, '-hide_banner', '-loglevel', 'error', '-i', str(output),
    '-f', 'null', '-'], check=True)
print(f'Created and decoded {output.name} ({output.stat().st_size:,} bytes).')
