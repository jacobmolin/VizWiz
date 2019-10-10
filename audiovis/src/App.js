import React, { Component } from 'react';
import './App.css';
import magicAudio from './resources/Magic - Coldplay.mp3';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      status: null,
      audioData: new Uint8Array(0),
      audioTimeData: new Uint8Array(0),
      paused: true,
      minFreq: 20,
      maxFreq: 22050,
      width: 1500,
      height: 640
    };
    this.trigger = this.trigger.bind(this);
    this.analysis = this.analysis.bind(this);
    this.tick = this.tick.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.preCalcPosX = this.preCalcPosX.bind(this);
    this.draw = this.draw.bind(this);
    this.canvas = React.createRef();
  }

  //-----Player-----//
  handlePlay() {
    this.setState({ paused: false });
  }

  handlePause() {
    this.setState({ paused: true });
  }

  trigger() {
    this.setState({ status: true });
    this.analysis();
  }

  //---- Analysis of audio signal -----//
  analysis() {
    this.player = document.getElementById('player');
    this.audioCtx = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.track = this.audioCtx.createMediaElementSource(this.player);
    this.analyser = this.audioCtx.createAnalyser();

    // The audio signal is too loud when going in to analyser
    // We reduce the gain before analyser
    // and increase the gain back after analyser

    // Create two gain nodes and set gain value
    this.gainPreAnalyser = this.audioCtx.createGain();
    this.gainPreAnalyser.gain.value = 0.25;
    this.gainPostAnalyser = this.audioCtx.createGain();
    this.gainPostAnalyser.gain.value = 4;

    // Connect track -> gainPre -> analyser -> gainPost -> destination
    this.track.connect(this.gainPreAnalyser);
    this.gainPreAnalyser.connect(this.analyser);
    this.analyser.connect(this.gainPostAnalyser);
    this.gainPostAnalyser.connect(this.audioCtx.destination);

    // this.analyser.fftSize = 32;
    // this.analyser.fftSize = 64;
    // this.analyser.fftSize = 128;
    // this.analyser.fftSize = 256;
    // this.analyser.fftSize = 512;
    // this.analyser.fftSize = 1024;
    this.analyser.fftSize = 2048;
    // this.analyser.fftSize = 4096;
    // this.analyser.fftSize = 8192;
    // this.analyser.fftSize = 16384;
    // this.analyser.fftSize = 32768;

    // Saving analyserBars from preCalcX() in this.analyserBars
    // analyserBars contains the x-positions of the different frequencies
    this.analyserBars = this.preCalcPosX();

    this.bufferLength = this.analyser.frequencyBinCount;

    // Creates an array with bufferLength empty places
    this.dataArray = new Uint8Array(this.bufferLength);
    requestAnimationFrame(this.tick);
  }

  preCalcPosX() {
    const minFreq = this.state.minFreq;
    const maxFreq = this.state.maxFreq;
    const width = this.state.width;
    const fftSize = this.analyser.fftSize;
    const sampleRate = this.audioCtx.sampleRate;
    const frequencyBinCount = this.analyser.frequencyBinCount;

    let i, freq;
    const minLog = Math.log10(minFreq);
    const bandWidth = width / (Math.log10(maxFreq) - minLog);

    this.barWidth = 1;
    let analyserBars = [],
      pos, lastPos = -1,
      minIndex = Math.floor(minFreq * fftSize / sampleRate),
      maxIndex = Math.min(Math.round(maxFreq * fftSize / sampleRate), frequencyBinCount - 1);

    console.log('minIndex', minIndex);
    console.log('maxIndex', maxIndex);

    for (i = minIndex; i <= maxIndex; i++) {
      freq = i * sampleRate / fftSize;  // frequency represented in this bin
      pos = Math.round(bandWidth * (Math.log10(freq) - minLog));  // avoid fractionary pixel values

      // if it's on a different X-coordinate, create a new bar for this frequency
      if (pos > lastPos) {
        analyserBars.push({ posX: pos, dataIdx: i, endIdx: 0, peak: 0, hold: 0 });
        lastPos = pos;
      } // otherwise, add this frequency to the last bar's range
      else if (analyserBars.length) {
        analyserBars[analyserBars.length - 1].endIdx = i;
      }
    }

    // calculate the position of the labels (octaves center frequencies) for the X-axis scale
    this.freqLabels = [
      { freq: 16 },
      { freq: 31 },
      { freq: 63 },
      { freq: 125 },
      { freq: 250 },
      { freq: 500 },
      { freq: 1000 },
      { freq: 2000 },
      { freq: 4000 },
      { freq: 8000 },
      { freq: 16000 }
    ];

    this.freqLabels.forEach(label => {
      label.posX = Math.round(bandWidth * (Math.log10(label.freq) - minLog));
      if (label.freq >= 1000)
        label.freq = (label.freq / 1000) + 'k';
    });
    return analyserBars;
  }

  tick() {
    if (!(this.state.paused)) {
      this.analyser.getByteFrequencyData(this.dataArray);
      this.setState({ audioData: this.dataArray });
      this.draw();
    }
    requestAnimationFrame(this.tick);
  }

  draw() {
    const canvas = this.canvas.current;
    const canvasCtx = canvas.getContext("2d");
    const audioData = this.state.audioData;
    const l = this.analyserBars.length;
    let bar;
    let barHeight = 0;
    let graphData = [audioData.length];
    let backgroundColor = 'hsl(220, 13%, 15%)';
    let backgroundColorAlpha = 'hsl(220, 13%, 15%, 0.7)';
    canvasCtx.fillStyle = backgroundColor;

    //-- GRADIENT ---//
    let grdClassic = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
    grdClassic.addColorStop(0, 'hsl( 0, 100%, 50% )');  // RED
    grdClassic.addColorStop(0.2, 'hsl( 55, 100%, 50% )'); // YELLOW
    grdClassic.addColorStop(0.3, 'hsl( 55, 100%, 50% )'); // YELLOW
    grdClassic.addColorStop(1, 'hsl( 120, 100%, 50% )');  // GREEN

    // Clear canvas
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < l; i++) {
      bar = this.analyserBars[i];
      barHeight = Math.round((audioData[bar.dataIdx] / 255 * canvas.height));

      //--- PEAK ---//
      if (barHeight >= bar.peak) {
        bar.peak = barHeight;
        bar.hold = 30; //set peak hold time to 30 frames (0,5s since 60frames/sek)
        bar.accel = 0;
      }

      if (bar.peak > 0) {
        if (bar.hold) {
          bar.hold--;
        } else {
          bar.accel++;
          bar.peak -= bar.accel;
        }
      }

      // Save data to draw lines and/or fields for graphs
      graphData[i] = { x: bar.posX, yPeak: Math.floor(bar.peak), yReg: Math.floor(barHeight) };
    }

    //--- VISUALIZE FIELD ---//
    // Create path for field under graph
    let region = new Path2D();
    region.moveTo(0, canvas.height);

    for (let j = 0; j < graphData.length; j++) {
      region.lineTo(graphData[j].x, canvas.height - graphData[j].yReg);
    }
    region.closePath();

    // Fill field under path
    canvasCtx.fillStyle = grdClassic;
    canvasCtx.fill(region);

    // Draw peak-graph
    canvasCtx.strokeStyle = grdClassic;
    canvasCtx.lineWidth = 1.5;

    for (let j = 0; j < graphData.length; j++) {
      if (graphData[j].yPeak !== 0) {
        if (j === 0) {
          canvasCtx.beginPath();
          canvasCtx.moveTo(0, canvas.height);
          canvasCtx.lineTo(graphData[j].x, canvas.height - graphData[j].yPeak);
          canvasCtx.stroke();
        } else {
          canvasCtx.beginPath();
          canvasCtx.moveTo(graphData[j - 1].x, canvas.height - graphData[j - 1].yPeak);
          canvasCtx.lineTo(graphData[j].x, canvas.height - graphData[j].yPeak);
          canvasCtx.stroke();
        }
      }
    }

    // Show scale
    let size = 7;

    canvasCtx.fillStyle = backgroundColorAlpha;
    canvasCtx.fillRect(0, canvas.height - size * 4, canvas.width, size * 4);

    canvasCtx.fillStyle = '#fff';
    canvasCtx.font = (size * 2) + 'px sans-serif';
    canvasCtx.textAlign = 'center';

    this.freqLabels.forEach(label => canvasCtx.fillText(label.freq, label.posX, canvas.height - size));
    canvasCtx.fillText('(Hz)', canvas.width - 20, canvas.height - size);
  }

  render() {
    let display = this.state.status ? { display: "block" } : { display: "none" };
    let displayButton = this.state.status ? { display: "none" } : { display: "block" };

    let content = (
      <div>
        <div onClick={this.trigger} className='button' style={displayButton}>ENTER</div>

        <div style={display}>
          <canvas width={this.state.width} height={this.state.height} ref={this.canvas} />

          <div className='playerText'>Press play to visualize</div>
          <audio controls src={magicAudio} id="player" onPlay={this.handlePlay} onPause={this.handlePause}>
            Your browser does not support the
            <code>audio</code> element.
            </audio>
        </div>

      </div>
    );

    return (
      <div className="App">
        <main>
          <header className="App-header">
            <div className="controls">
              {content}
            </div>
          </header>
        </main>
      </div>
    );
  }
}
export default App;
