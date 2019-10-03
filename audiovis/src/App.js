import React, { Component } from 'react';
import './App.css';
import magicAudio from './resources/Magic - Coldplay.mp3';  // 20_20k_sweep.mp3
//import AudioVisuliser from './AudioVisuliser';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      audio: null,
      status: null,
      audioData: new Uint8Array(0),
      audioTimeData: new Uint8Array(0),
      paused: true,
      minFreq: 20,
      maxFreq: 22000,
      width: 1280,
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

    //this.barData = null;
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

    //sparar analyserBars från preCalcX() i this.analyserBars
    //analyserBars bestämmer x-axeln som en array
    this.analyserBars = this.preCalcPosX();

    this.bufferLength = this.analyser.frequencyBinCount;
    //skapar array med bufferLength´s många tomma platser
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

    for (i = minIndex; i <= maxIndex; i++) {
      freq = i * sampleRate / fftSize;  // frequency represented in this bin
      pos = Math.round(bandWidth * (Math.log10(freq) - minLog));  // avoid fractionary pixel values

      // if it's on a different X-coordinate, create a new bar for this frequency
      if (pos > lastPos) {
        analyserBars.push({ posX: pos, dataIdx: i, endIdx: 0, peak: 0, hold: 0 }); // average: false, , accel: 0
        lastPos = pos;
      } // otherwise, add this frequency to the last bar's range
      else if (analyserBars.length) {
        analyserBars[analyserBars.length - 1].endIdx = i;
      }
    }


    // calculate the position of the labels (octaves center frequencies) for the X-axis scale
    const freqLabels = [
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

    freqLabels.forEach(label => {
      label.posX = width * (Math.log10(label.freq) - minLog);
      if (label.freq >= 1000)
        label.freq = (label.freq / 1000) + 'k';
    });
    return analyserBars;
  }

  tick() {
    if (!(this.state.paused)) {
      this.analyser.getByteFrequencyData(this.dataArray);
      this.analyser.getByteTimeDomainData(this.timeDataArray);
      this.setState({ audioData: this.dataArray,
                      audioTimeData: this.timeDataArray});
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
    canvasCtx.fillStyle = 'hsl(220, 13%, 15%)'; //#282c34

    /*let gradient = {
        bgColor: 'orange',
        colorStops: [
          'hsl( 0, 80%, 50% )', = 0
          'hsl( 60, 80%, 50% )', = 0.2
          'hsl( 120, 80%, 50% )', = 0.4
          'hsl( 180, 80%, 50% )', = 0.6
          'hsl( 240, 80%, 50% )', = 0.8
        ]
    }*/

    //-- GRADIENTS ---//
    let grd = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
    grd.addColorStop(0, 'hsl( 60, 80%, 50% )');
    grd.addColorStop(0.2, 'hsl( 60, 80%, 50% )');
    grd.addColorStop(0.4, 'hsl( 120, 80%, 50% )');
    grd.addColorStop(0.6, 'hsl( 180, 80%, 50% )');
    grd.addColorStop(0.8, 'hsl( 240, 80%, 50% )');

    let grdClassic = canvasCtx.createLinearGradient(0, 0, 0, canvas.height);
    grdClassic.addColorStop(0, 'hsl( 0, 100%, 50% )');
    grdClassic.addColorStop(0.6, 'hsl( 60, 100%, 50% )');
    grdClassic.addColorStop(1, 'hsl( 120, 100%, 50% )');

    // Clear canvas
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < l; i++) {
      bar = this.analyserBars[i];

      /*--- I have commented out a lot here
      because it's not needed in our case,
      UNLESS we want to use bar.average ---*/


      // if (bar.endIdx === 0) { // single FFT bin
      //getByteFrequencyData frequency data is composed of integers on a scale = 0-255 * height = 640
      barHeight = Math.round((audioData[bar.dataIdx] / 255 * canvas.height));

      /*   }
        else { 	// range of bins
         barHeight = 0;
       if (bar.average) {
         //use the average value of the range
         for (let j = bar.dataIdx; j <= bar.endIdx; j++) {
           barHeight += audioData[j];
           barHeight = barHeight / (bar.endIdx - bar.dataIdx + 1);
         }
       }
       else { 
        //use the highest value in the range
        for (let j = bar.dataIdx; j <= bar.endIdx; j++) {
          barHeight = Math.max(barHeight, audioData[j]) / 255 * canvas.height;
        }
        }*/


      //--- PEAK ---//
      if (barHeight >= bar.peak) {
        bar.peak = barHeight;
        bar.hold = 30; //set peak hold time to 30 frames (0,5s since 60frames/sek)
        bar.accel = 0;
        bar.zeropoint = 0;
      }


      canvasCtx.fillStyle = grd;
      
      /*--- Draw one bar for amplitude (dB) = barHeight
       at the frequency (Hz) = bar.posX ---*/

      //canvasCtx.fillRect(bar.posX, canvas.height, this.barWidth, -barHeight);
      //canvasCtx.fillRect( bar.posX, canvas.height - bar.peak, this.barWidth, 2)


      /*
      if (bar.hold) {
        bar.hold--;
      }
      else {
        bar.zeropoint++;
        bar.peak -= bar.zeropoint;
      }
      */

      if (bar.peak > 0) {
        // Draw peak dots
        //canvasCtx.fillRect(bar.posX, canvas.height - bar.peak, this.barWidth, 2);
        if (bar.hold)
          bar.hold--;
        else {
          bar.accel++;
          bar.peak -= bar.accel;
        }
      }
      // Save data to draw lines and/or fields for graphs
      graphData[i] = { x: bar.posX, yPeak: Math.floor(bar.peak), yReg: Math.floor(barHeight) };
    }


    // Bar to check gradient
    // canvasCtx.fillStyle = grdClassic;
    canvasCtx.fillStyle = grd;
    canvasCtx.fillRect(canvas.width-30, canvas.height, 30, -canvas.height);


    //--- VISUALISE FIELD ---//
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

    /*
    // Draw regular graph
        canvasCtx.strokeStyle = 'hsla(342,0%,90%, 0.6)';
        canvasCtx.lineWidth = 1.5;
    
        for (let j = 0; j < graphData.length; j++) {
          if (graphData[j].yReg !== 0) {
            if (j === 0) {
              canvasCtx.beginPath();
              canvasCtx.moveTo(0, canvas.height);
              canvasCtx.lineTo(graphData[j].x, canvas.height - graphData[j].yReg);
              canvasCtx.stroke();
            } else {
              canvasCtx.beginPath();
              canvasCtx.moveTo(graphData[j - 1].x, canvas.height - graphData[j - 1].yReg);
              canvasCtx.lineTo(graphData[j].x, canvas.height - graphData[j].yReg);
              canvasCtx.stroke();
            }
          }
        }*/

    // Draw peak-graph
    canvasCtx.strokeStyle = grdClassic;  //'hsla(0,77%,50%, 0.4)'
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
    /* let size = 5 * pixelRatio;
 
     if ( isFullscreen() )
       size *= 2;
 
     canvasCtx.fillStyle = '#000c';
     canvasCtx.fillRect( 0, canvas.height - size * 4, canvas.width, size * 4 );
 
     canvasCtx.fillStyle = '#fff';
     canvasCtx.font = ( size * 2 ) + 'px sans-serif';
     canvasCtx.textAlign = 'center';
 
     freqLabels.forEach( label => canvasCtx.fillText( label.freq, label.posX, canvas.height - size ) );
   }
*/
  }



  render() {
    let display = this.state.status ? { display: "block" } : { display: "none" };
    let displayButton = this.state.status ? { display: "none" } : { display: "block" };


    let content = (
      <div>
        <div onClick={this.trigger} class='button' style={displayButton}>ENTER ME</div>

        <div style={display}>
          <canvas width={this.state.width} height={this.state.height} ref={this.canvas} />
          <figure>
            <figcaption>Play to visualize</figcaption>
            <audio controls src={magicAudio} id="player" onPlay={this.handlePlay} onPause={this.handlePause}>
              Your browser does not support the
            <code>audio</code> element.
            </audio>
          </figure>
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
