# Iconic Rhythm Notation

A browser-based application for creating and visualizing musical rhythm using **blocks instead of traditional notation**.

## Overview

Traditional rhythm notation relies on note symbols and divisions (quarter notes, eighth notes, etc.). This application represents rhythm using **blocks of varying lengths**, where block width directly represents duration. The goal is to create an intuitive, visual way to understand rhythm structure without needing traditional sheet music knowledge.

## Getting Started

Simply open `index.html` in any modern web browser. No server or installation required.

## Features

### Creating Rhythms

**Block Palette**
- Select a block size (1-8) from the palette
- Click on the grid to place the block
- Blocks snap to the grid automatically

**Numeric Entry**
- Type durations separated by commas (e.g., `4, 2, 1, 1, 3, 1`)
- Click "Generate" to create blocks from the sequence

**Pitch Mode**
- Enable "Show Pitch" to add vertical positioning to blocks
- Enter pitch values separated by commas (e.g., `1, 3, 5, 7`)
- Supports octave modifiers: `+1` (octave up), `++3` (two octaves up), `-5` (octave down)
- Container height dynamically adjusts to fit the pitch range

**Editing Blocks**
- **Move**: Drag blocks to reposition them horizontally
- **Resize**: Drag the right edge of a block
- **Select**: Click a block to select it (shows white border)
- **Delete**: Press `Delete` or `Backspace` to remove selected block
- **Right-click**: Delete a block directly

### Display Options

**Wrap Mode**
- Toggle "Wrap blocks" to display rhythm across multiple lines
- Wraps at measure boundaries for easy reading
- Enabled by default

**Fullscreen**
- Click the fullscreen button for distraction-free viewing
- Press `Escape` or click the exit button to return

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

**Metronome**
- Toggle metronome clicks on/off during playback

**Audio Cues**
- **Block hit**: Higher pitch (800Hz) when playhead crosses a block
- **Metronome**: Lower pitch (400Hz) on empty grid positions
- **Count-in**: Highest pitch (1000Hz) for pre-clicks

### Grid Settings

- **Number of dashes**: Set the total grid length (4-256)
- **Units per measure**: Define measure groupings (affects wrapping)
- **Pickup offset**: Set anacrusis/pickup beats before first measure
- **Unit width**: Adjust horizontal size of each unit (40-200px, or custom via input)
- **Unit height**: Adjust vertical size of blocks (40-200px, or custom via input)
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

### Import/Export

**IRN Format (.irn)**
- Native JSON-based file format for saving and loading rhythms
- Preserves song name, rhythm, pitch, tempo, and grid settings
- Enter song name in the "Song Info" section
- Click "Export .irn" to save, "Import .irn" to load

**IRN File Format Example:**
```json
{
  "name": "My Song",
  "rhythm": ["4", "2", "x", "1", "3x"],
  "pitch": ["1", "3", null, "5", null],
  "settings": {
    "tempo": 120,
    "unitsPerMeasure": 16,
    "pickupOffset": 0
  }
}
```
- Rhythm: Numbers for block lengths, `x` for 1 space, `2x` for 2 spaces, etc.
- Pitch: `1`-`7` for base octave, `+1` for octave up, `-5` for octave down

**Image Export**
- **Export SVG**: Vector format, ideal for printing and scaling
- **Export PNG**: Raster image format
- Exports use white background and include wrapped layout

**MIDI Import**
- Click "Import MIDI" to load a MIDI file
- Note durations are converted to block units
- Overlapping notes are filtered

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Delete` / `Backspace` | Delete selected block |
| `Escape` | Exit fullscreen mode |

## Technical Details

- Pure HTML, CSS, and JavaScript (no frameworks)
- CSS custom properties for dynamic sizing
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
