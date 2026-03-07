// Rhythm Blocks Application

class RhythmBlocks {
    constructor() {
        // Configuration
        this.unitWidth = 60;
        this.blockHeight = 60;
        this.gridHeight = 20;
        this.svgPadding = 20;
        this.unitsPerMeasure = 16;
        this.totalUnits = 12;
        
        // State
        this.blocks = [];
        this.selectedBlockSize = null;
        this.selectedBlock = null;
        this.selectedBlockId = null;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        
        // Playback state
        this.isPlaying = false;
        this.isPaused = false;
        this.playheadPosition = 0;
        this.tempo = 120;
        this.loop = false;
        this.animationId = null;
        this.lastTimestamp = null;
        this.preClickCount = 4;
        this.isCountingIn = false;
        this.countInPosition = 0;
        this.lastMetronomeUnit = -1;
        
        // Color palettes
        this.palettes = {
            default: {
                1: '#4ecdc4',
                2: '#45b7d1',
                3: '#96ceb4',
                4: '#ffeaa7',
                5: '#fab1a0',
                6: '#dfe6e9',
                7: '#a29bfe',
                8: '#fd79a8'
            },
            warm: {
                1: '#ff6b6b',
                2: '#ffa502',
                3: '#ff7f50',
                4: '#ffd93d',
                5: '#ffb347',
                6: '#ff9f43',
                7: '#ee5a24',
                8: '#ff6348'
            },
            cool: {
                1: '#74b9ff',
                2: '#0984e3',
                3: '#00cec9',
                4: '#81ecec',
                5: '#55efc4',
                6: '#a29bfe',
                7: '#6c5ce7',
                8: '#5f27cd'
            },
            monochrome: {
                1: '#dfe6e9',
                2: '#b2bec3',
                3: '#636e72',
                4: '#555555',
                5: '#444444',
                6: '#3a3a3a',
                7: '#2a2a2a',
                8: '#222222'
            }
        };
        this.currentPalette = 'default';
        
        // DOM Elements
        this.svg = document.getElementById('rhythmSvg');
        this.blocksGroup = document.getElementById('blocksGroup');
        this.dashGrid = document.getElementById('dashGrid');
        this.playhead = document.getElementById('playhead');
        
        // Theme
        this.theme = localStorage.getItem('rhythmBlocksTheme') || 'dark';
        
        // Audio
        this.audioContext = null;
        this.playedBlocks = new Set();
        
        this.init();
    }
    
    init() {
        this.applyTheme();
        this.initAudio();
        this.bindEvents();
        this.renderGrid();
        this.updateSvgSize();
    }
    
    initAudio() {
        // Create audio context on first user interaction
        const initOnInteraction = () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            document.removeEventListener('click', initOnInteraction);
        };
        document.addEventListener('click', initOnInteraction);
    }
    
    playClick(frequency = 800, duration = 0.05) {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    playMetronomeClick() {
        // Lower pitch, shorter click for metronome
        this.playClick(400, 0.03);
    }
    
    playBlockClick() {
        // Higher pitch for block hits
        this.playClick(800, 0.08);
    }
    
    playCountInClick() {
        // Higher pitch for count-in
        this.playClick(1000, 0.06);
    }
    
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('.icon');
            const label = toggleBtn.querySelector('.label');
            if (this.theme === 'dark') {
                icon.textContent = '🌙';
                label.textContent = 'Dark';
            } else {
                icon.textContent = '☀️';
                label.textContent = 'Light';
            }
        }
    }
    
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('rhythmBlocksTheme', this.theme);
        this.applyTheme();
    }
    
    bindEvents() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Block palette selection
        document.querySelectorAll('.palette-block').forEach(block => {
            block.addEventListener('click', (e) => this.selectPaletteBlock(e));
        });
        
        // SVG click for placing blocks
        this.svg.addEventListener('click', (e) => this.handleSvgClick(e));
        this.svg.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.svg.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.svg.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.svg.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        this.svg.addEventListener('contextmenu', (e) => this.handleRightClick(e));
        
        // Playback controls
        document.getElementById('playBtn').addEventListener('click', () => this.play());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        
        // Tempo control
        const tempoSlider = document.getElementById('tempoSlider');
        const tempoInput = document.getElementById('tempoInput');
        
        tempoSlider.addEventListener('input', (e) => {
            this.tempo = parseInt(e.target.value);
            tempoInput.value = this.tempo;
        });
        
        tempoInput.addEventListener('input', (e) => {
            let val = parseInt(e.target.value);
            if (!isNaN(val) && val >= 1) {
                this.tempo = val;
                tempoSlider.value = Math.min(val, 240);
            }
        });
        
        // Loop toggle
        document.getElementById('loopToggle').addEventListener('change', (e) => {
            this.loop = e.target.checked;
        });
        
        // Pre-click count
        const preClickSlider = document.getElementById('preClickCount');
        preClickSlider.addEventListener('input', (e) => {
            this.preClickCount = parseInt(e.target.value);
            document.getElementById('preClickValue').textContent = this.preClickCount;
        });
        
        // Numeric generation
        document.getElementById('generateBtn').addEventListener('click', () => this.generateFromNumeric());
        document.getElementById('numericInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateFromNumeric();
        });
        
        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => this.clearBlocks());
        
        // Export buttons
        document.getElementById('exportSvgBtn').addEventListener('click', () => this.exportSvg());
        document.getElementById('exportPngBtn').addEventListener('click', () => this.exportPng());
        
        // MIDI import
        document.getElementById('importMidiBtn').addEventListener('click', () => {
            document.getElementById('midiFileInput').click();
        });
        document.getElementById('midiFileInput').addEventListener('change', (e) => this.importMidi(e));
        
        // Color palette selection
        document.querySelectorAll('input[name="palette"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentPalette = e.target.value;
                this.renderBlocks();
            });
        });
        
        // Grid settings
        document.getElementById('totalDashes').addEventListener('change', (e) => {
            this.totalUnits = parseInt(e.target.value);
            this.updateSvgSize();
            this.renderGrid();
        });
        
        document.getElementById('unitsPerMeasure').addEventListener('change', (e) => {
            this.unitsPerMeasure = parseInt(e.target.value);
            this.renderGrid();
        });
        
        document.getElementById('showMeasures').addEventListener('change', () => {
            this.renderGrid();
        });
        
        // Keyboard events for delete
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Click outside to deselect
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.rhythm-block') && !e.target.closest('.block-palette')) {
                this.deselectBlock();
            }
        });
    }
    
    handleKeyDown(e) {
        if ((e.key === 'Delete' || e.key === 'Backspace') && this.selectedBlockId !== null) {
            e.preventDefault();
            this.removeBlock(this.selectedBlockId);
            this.selectedBlockId = null;
        }
    }
    
    selectBlock(blockId) {
        this.selectedBlockId = blockId;
        this.renderBlocks();
    }
    
    deselectBlock() {
        if (this.selectedBlockId !== null) {
            this.selectedBlockId = null;
            this.renderBlocks();
        }
    }
    
    selectPaletteBlock(e) {
        const block = e.currentTarget;
        const size = parseInt(block.dataset.size);
        
        // Toggle selection
        if (this.selectedBlockSize === size) {
            this.selectedBlockSize = null;
            block.classList.remove('selected');
        } else {
            document.querySelectorAll('.palette-block').forEach(b => b.classList.remove('selected'));
            this.selectedBlockSize = size;
            block.classList.add('selected');
        }
    }
    
    handleSvgClick(e) {
        if (this.isDragging || this.isResizing) return;
        if (!this.selectedBlockSize) return;
        if (e.target.closest('.rhythm-block')) return;
        
        const rect = this.svg.getBoundingClientRect();
        const x = e.clientX - rect.left - this.svgPadding;
        const unitPosition = Math.floor(x / this.unitWidth);
        
        if (unitPosition >= 0 && unitPosition < this.totalUnits) {
            this.addBlock(unitPosition, this.selectedBlockSize);
        }
    }
    
    handleMouseDown(e) {
        const blockEl = e.target.closest('.rhythm-block');
        const resizeHandle = e.target.closest('.block-resize-handle');
        
        if (resizeHandle) {
            this.isResizing = true;
            const blockId = parseInt(resizeHandle.dataset.blockId);
            this.selectedBlock = this.blocks.find(b => b.id === blockId);
            e.preventDefault();
        } else if (blockEl) {
            this.isDragging = true;
            const blockId = parseInt(blockEl.dataset.blockId);
            this.selectedBlock = this.blocks.find(b => b.id === blockId);
            this.selectBlock(blockId);
            
            const rect = this.svg.getBoundingClientRect();
            const x = e.clientX - rect.left - this.svgPadding;
            this.dragOffset.x = x - (this.selectedBlock.start * this.unitWidth);
            e.preventDefault();
        }
    }
    
    handleMouseMove(e) {
        if (!this.selectedBlock) return;
        
        const rect = this.svg.getBoundingClientRect();
        const x = e.clientX - rect.left - this.svgPadding;
        
        if (this.isDragging) {
            const newStart = Math.round((x - this.dragOffset.x) / this.unitWidth);
            const clampedStart = Math.max(0, Math.min(newStart, this.totalUnits - this.selectedBlock.length));
            
            if (clampedStart !== this.selectedBlock.start) {
                this.selectedBlock.start = clampedStart;
                this.renderBlocks();
            }
        } else if (this.isResizing) {
            const newEnd = Math.round(x / this.unitWidth);
            const newLength = Math.max(1, newEnd - this.selectedBlock.start);
            const clampedLength = Math.min(newLength, this.totalUnits - this.selectedBlock.start);
            
            if (clampedLength !== this.selectedBlock.length) {
                this.selectedBlock.length = clampedLength;
                this.renderBlocks();
            }
        }
    }
    
    handleMouseUp(e) {
        this.isDragging = false;
        this.isResizing = false;
        this.selectedBlock = null;
    }
    
    handleRightClick(e) {
        const blockEl = e.target.closest('.rhythm-block');
        if (blockEl) {
            e.preventDefault();
            const blockId = parseInt(blockEl.dataset.blockId);
            this.removeBlock(blockId);
        }
    }
    
    addBlock(start, length) {
        const block = {
            id: Date.now(),
            start: start,
            length: length
        };
        this.blocks.push(block);
        this.renderBlocks();
    }
    
    removeBlock(id) {
        this.blocks = this.blocks.filter(b => b.id !== id);
        this.renderBlocks();
    }
    
    clearBlocks() {
        this.blocks = [];
        this.renderBlocks();
        this.stop();
    }
    
    updateTotalUnits() {
        // Only update SVG size and grid, don't auto-expand totalUnits
        this.updateSvgSize();
        this.renderGrid();
    }
    
    updateSvgSize() {
        const width = this.totalUnits * this.unitWidth + this.svgPadding * 2;
        this.svg.setAttribute('width', width);
        this.playhead.setAttribute('y2', this.blockHeight + this.gridHeight + 40);
    }
    
    renderGrid() {
        this.dashGrid.innerHTML = '';
        const showMeasures = document.getElementById('showMeasures').checked;
        const y = this.blockHeight + 30;
        
        for (let i = 0; i <= this.totalUnits; i++) {
            const x = this.svgPadding + i * this.unitWidth;
            
            // Measure lines
            if (showMeasures && i % this.unitsPerMeasure === 0) {
                const measureLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                measureLine.setAttribute('x1', x);
                measureLine.setAttribute('y1', 10);
                measureLine.setAttribute('x2', x);
                measureLine.setAttribute('y2', y + this.gridHeight);
                measureLine.setAttribute('class', 'measure-line');
                this.dashGrid.appendChild(measureLine);
            }
            
            // Grid dashes
            if (i < this.totalUnits) {
                const dash = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                dash.setAttribute('x1', x);
                dash.setAttribute('y1', y);
                dash.setAttribute('x2', x + this.unitWidth - 4);
                dash.setAttribute('y2', y);
                dash.setAttribute('class', 'grid-dash');
                this.dashGrid.appendChild(dash);
            }
        }
    }
    
    renderBlocks() {
        this.blocksGroup.innerHTML = '';
        const palette = this.palettes[this.currentPalette];
        const y = 20;
        
        this.blocks.forEach(block => {
            const x = this.svgPadding + block.start * this.unitWidth;
            const width = block.length * this.unitWidth - 4;
            
            // Get color based on length
            const colorKey = this.getColorKey(block.length);
            const color = palette[colorKey] || palette[1];
            
            // Create block group
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'rhythm-block');
            group.setAttribute('data-block-id', block.id);
            
            // Check if selected
            const isSelected = block.id === this.selectedBlockId;
            
            // Block rectangle
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', width);
            rect.setAttribute('height', this.blockHeight);
            rect.setAttribute('rx', 6);
            rect.setAttribute('fill', color);
            if (isSelected) {
                rect.setAttribute('stroke', '#ffffff');
                rect.setAttribute('stroke-width', '3');
            }
            group.appendChild(rect);
            
                        
            // Resize handle
            const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            handle.setAttribute('x', x + width - 8);
            handle.setAttribute('y', y);
            handle.setAttribute('width', 8);
            handle.setAttribute('height', this.blockHeight);
            handle.setAttribute('rx', 3);
            handle.setAttribute('class', 'block-resize-handle');
            handle.setAttribute('data-block-id', block.id);
            group.appendChild(handle);
            
            this.blocksGroup.appendChild(group);
        });
    }
    
    getColorKey(length) {
        const keys = [1, 2, 3, 4, 5, 6, 7, 8];
        // Find closest key
        let closest = keys[0];
        let minDiff = Math.abs(length - closest);
        for (const key of keys) {
            const diff = Math.abs(length - key);
            if (diff < minDiff) {
                minDiff = diff;
                closest = key;
            }
        }
        return closest;
    }
    
    getTextColor(bgColor) {
        // Simple luminance check
        const hex = bgColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#1a1a2e' : '#ffffff';
    }
    
    generateFromNumeric() {
        const input = document.getElementById('numericInput').value;
        const durations = input.split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n) && n > 0);
        
        if (durations.length === 0) return;
        
        this.blocks = [];
        let currentStart = 0;
        
        durations.forEach(length => {
            this.blocks.push({
                id: Date.now() + Math.random(),
                start: currentStart,
                length: length
            });
            currentStart += length;
        });
        
        this.updateTotalUnits();
        this.renderBlocks();
    }
    
    // Playback methods
    play() {
        if (this.blocks.length === 0) return;
        
        // Initialize audio context if needed
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (this.isPaused && !this.isCountingIn) {
            this.isPaused = false;
        } else {
            this.playheadPosition = 0;
            this.playedBlocks = new Set();
            this.lastMetronomeUnit = -1;
            
            // Start count-in if pre-clicks are set
            if (this.preClickCount > 0) {
                this.isCountingIn = true;
                this.countInPosition = 0;
                this.countInClicks = 0;
            }
        }
        
        this.isPlaying = true;
        this.lastTimestamp = null;
        this.animationId = requestAnimationFrame((ts) => this.animate(ts));
    }
    
    pause() {
        this.isPlaying = false;
        this.isPaused = true;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        this.isCountingIn = false;
        this.playheadPosition = 0;
        this.lastMetronomeUnit = -1;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.updatePlayhead();
    }
    
    animate(timestamp) {
        if (!this.isPlaying) return;
        
        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }
        
        const elapsed = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        
        // Calculate units per millisecond based on tempo
        // At 120 BPM, 1 beat = 500ms, assume 4 units per beat
        const unitsPerBeat = 4;
        const msPerBeat = 60000 / this.tempo;
        const unitsPerMs = unitsPerBeat / msPerBeat;
        
        // Handle count-in
        if (this.isCountingIn) {
            this.countInPosition += elapsed * unitsPerMs;
            const currentBeat = Math.floor(this.countInPosition);
            
            // Play count-in clicks (0, 1, 2, 3 for 4 pre-clicks)
            if (currentBeat > this.countInClicks && this.countInClicks < this.preClickCount) {
                this.playCountInClick();
                this.countInClicks++;
            }
            
            // Wait for the full duration (preClickCount + 1 beats worth of time)
            // so the first actual beat aligns with where the next count-in click would be
            if (this.countInPosition >= this.preClickCount) {
                this.isCountingIn = false;
                this.lastTimestamp = null;
            }
            
            this.animationId = requestAnimationFrame((ts) => this.animate(ts));
            return;
        }
        
        const prevPosition = this.playheadPosition;
        this.playheadPosition += elapsed * unitsPerMs;
        
        // Metronome click on each unit
        const currentUnit = Math.floor(this.playheadPosition);
        if (currentUnit > this.lastMetronomeUnit) {
            // Check if there's a block starting at this unit
            const hasBlockAtUnit = this.blocks.some(b => b.start === currentUnit);
            if (!hasBlockAtUnit) {
                this.playMetronomeClick();
            }
            this.lastMetronomeUnit = currentUnit;
        }
        
        // Check for blocks that should trigger sound
        this.blocks.forEach(block => {
            const blockStart = block.start;
            if (prevPosition <= blockStart && this.playheadPosition > blockStart) {
                if (!this.playedBlocks.has(block.id)) {
                    this.playedBlocks.add(block.id);
                    // Block click sound
                    this.playBlockClick();
                }
            }
        });
        
        // Find the end of the rhythm
        const maxEnd = Math.max(...this.blocks.map(b => b.start + b.length), 16);
        
        if (this.playheadPosition >= maxEnd) {
            if (this.loop) {
                this.playheadPosition = 0;
                this.playedBlocks = new Set();
            } else {
                this.stop();
                return;
            }
        }
        
        this.updatePlayhead();
        this.animationId = requestAnimationFrame((ts) => this.animate(ts));
    }
    
    updatePlayhead() {
        const x = this.svgPadding + this.playheadPosition * this.unitWidth;
        this.playhead.setAttribute('x1', x);
        this.playhead.setAttribute('x2', x);
        
        // Auto-scroll to keep playhead visible
        const container = document.querySelector('.rhythm-view-container');
        if (container) {
            const containerWidth = container.clientWidth;
            const scrollLeft = container.scrollLeft;
            const playheadX = x;
            
            // If playhead is past the visible area, scroll to follow it
            if (playheadX > scrollLeft + containerWidth - 100) {
                container.scrollLeft = playheadX - 100;
            }
        }
    }
    
    // Export methods
    exportSvg() {
        const svgClone = this.svg.cloneNode(true);
        
        // Add styles inline - use dark colors for white background
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `
            .grid-dash { stroke: #cccccc; stroke-width: 3; }
            .measure-line { stroke: #666666; stroke-width: 2; }
        `;
        svgClone.insertBefore(style, svgClone.firstChild);
        
        // Remove playhead for export
        const playhead = svgClone.querySelector('#playhead');
        if (playhead) playhead.remove();
        
        // Set white background
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', '100%');
        bg.setAttribute('height', '100%');
        bg.setAttribute('fill', '#ffffff');
        svgClone.insertBefore(bg, svgClone.firstChild);
        
        const svgData = new XMLSerializer().serializeToString(svgClone);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'rhythm-blocks.svg';
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    exportPng() {
        const svgClone = this.svg.cloneNode(true);
        
        // Remove playhead
        const playhead = svgClone.querySelector('#playhead');
        if (playhead) playhead.remove();
        
        // Set white background
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', '100%');
        bg.setAttribute('height', '100%');
        bg.setAttribute('fill', '#ffffff');
        svgClone.insertBefore(bg, svgClone.firstChild);
        
        // Add inline styles - use dark colors for white background
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `
            .grid-dash { stroke: #cccccc; stroke-width: 3; }
            .measure-line { stroke: #666666; stroke-width: 2; }
        `;
        svgClone.insertBefore(style, svgClone.firstChild);
        
        const svgData = new XMLSerializer().serializeToString(svgClone);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = 'rhythm-blocks.png';
            link.click();
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
    
    // MIDI Import
    async importMidi(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const midi = new Midi(arrayBuffer);
            
            // Find the smallest note duration to use as unit
            let minDuration = Infinity;
            const notes = [];
            
            midi.tracks.forEach(track => {
                track.notes.forEach(note => {
                    if (note.duration > 0) {
                        minDuration = Math.min(minDuration, note.duration);
                        notes.push({
                            time: note.time,
                            duration: note.duration
                        });
                    }
                });
            });
            
            if (notes.length === 0) {
                alert('No notes found in MIDI file');
                return;
            }
            
            // Quantize to smallest duration
            const unitDuration = minDuration;
            
            this.blocks = notes.map((note, index) => ({
                id: Date.now() + index,
                start: Math.round(note.time / unitDuration),
                length: Math.max(1, Math.round(note.duration / unitDuration))
            }));
            
            // Remove overlapping blocks (keep first)
            this.blocks.sort((a, b) => a.start - b.start);
            const filtered = [];
            let lastEnd = -1;
            
            this.blocks.forEach(block => {
                if (block.start >= lastEnd) {
                    filtered.push(block);
                    lastEnd = block.start + block.length;
                }
            });
            
            this.blocks = filtered;
            this.updateTotalUnits();
            this.renderBlocks();
            
        } catch (err) {
            console.error('Error importing MIDI:', err);
            alert('Error importing MIDI file. Make sure it is a valid MIDI file.');
        }
        
        // Reset file input
        e.target.value = '';
    }
    
    // Get rhythm data for export/save
    getData() {
        return {
            unit: 1,
            blocks: this.blocks.map(b => ({
                start: b.start,
                length: b.length
            }))
        };
    }
    
    // Load rhythm data
    loadData(data) {
        this.blocks = data.blocks.map((b, i) => ({
            id: Date.now() + i,
            start: b.start,
            length: b.length
        }));
        this.updateTotalUnits();
        this.renderBlocks();
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.rhythmBlocks = new RhythmBlocks();
});
