# Rhythm Blocks

A browser-based application for creating and visualizing musical rhythm using **blocks instead of traditional notation**.

## Overview

Traditional rhythm notation relies on note symbols and divisions (quarter notes, eighth notes, etc.). This application represents rhythm using **blocks of varying lengths**, where block width directly represents duration. The goal is to create an intuitive, visual way to understand rhythm structure without needing traditional sheet music knowledge.

## Getting Started

Simply open `index.html` in any modern web browser. No server or installation required.

## Features

### Creating Rhythms

**Block Palette**
- Select a block size (1-8) from the palette at the bottom
- Click on the grid to place the block
- Blocks snap to the grid automatically

**Numeric Entry**
- Type durations separated by commas (e.g., `4, 2, 1, 1, 3, 1`)
- Click "Generate" to create blocks from the sequence

**Editing Blocks**
- **Move**: Drag blocks to reposition them
- **Resize**: Drag the right edge of a block
- **Select**: Click a block to select it (shows white border)
- **Delete**: Press `Delete` or `Backspace` to remove selected block
- **Right-click**: Delete a block directly

### Playback

- **Play**: Start playback with optional count-in
- **Pause**: Pause playback (resume from current position)
- **Stop**: Stop and reset to beginning
- **Loop**: Toggle continuous looping

**Tempo**
- Use the slider or type a specific BPM value (1-300)

**Count-in**
- Set 0-8 pre-clicks before playback starts
- Count-in clicks are higher-pitched for distinction

**Audio Cues**
- **Block hit**: Higher pitch (800Hz) when playhead crosses a block
- **Metronome**: Lower pitch (400Hz) on empty grid positions
- **Count-in**: Highest pitch (1000Hz) for pre-clicks

### Grid Settings

- **Number of dashes**: Set the total grid length (4-256)
- **Units per measure**: Define measure groupings
- **Show measure lines**: Toggle vertical measure markers

### Visual Options

**Color Palettes**
- Default (colorful)
- Warm (reds/oranges)
- Cool (blues/greens)
- Monochrome (grayscale)

**Theme**
- Toggle between dark and light mode (button in toolbar)
- Theme preference is saved in browser

### Export

- **Export SVG**: Vector format, ideal for printing
- **Export PNG**: Raster image format
- Exports always use a white background regardless of current theme

### MIDI Import

- Click "Import MIDI" to load a MIDI file
- Note durations are converted to block units
- Overlapping notes are filtered

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Delete` / `Backspace` | Delete selected block |

## Technical Details

- Pure HTML, CSS, and JavaScript (no frameworks)
- SVG-based rendering for crisp visuals
- Web Audio API for sound generation (no external audio files)
- Works entirely offline
- No data is sent to any server

## Browser Support

Works in all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## License

Open source - feel free to modify and use as needed.
