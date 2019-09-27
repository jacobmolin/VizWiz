import React, { Component } from 'react';
import './App.css';
import magicAudio from './resources/20_20k_sweep.mp3';
import AudioVisuliser from './AudioVisuliser';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      audio: null,
      status: null,
      audioData: new Uint8Array(0),
      paused: true,
      minFreq: 20,
      maxFreq: 22000,
      width: 640,
      height: 270
      //analyserBars: [ {posX: 0, dataIdx: 0, endIdx: 0, average: false, peak: 0, hold: 0, accel: 0 } ]

    };
    this.trigger = this.trigger.bind(this);
    this.analysis = this.analysis.bind(this);
    this.tick = this.tick.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.preCalcPosX = this.preCalcPosX.bind(this);
    this.draw = this.draw.bind(this);
  }

  //---TESTING NEW STUFF--------//
  preCalcPosX() {

    let i, freq,
      minLog = Math.log10( this.state.minFreq ),
      bandWidth = this.state.width / ( Math.log10( this.state.maxFreq ) - minLog );

    this.analyserBars = [];
    let pos,
        barWidth = 1,
        lastPos = -1,
        minIndex = Math.floor( this.state.minFreq * this.analyser.fftSize / this.audioCtx.sampleRate),
        maxIndex = Math.min( Math.round( this.state.maxFreq * this.analyser.fftSize / this.audioCtx.sampleRate ), this.analyser.frequencyBinCount - 1 );

    for ( i = minIndex; i <= maxIndex; i++) {
      freq = i * this.audioCtx.sampleRate / this.analyser.fftSize;
      pos = Math.round( this.state.width * ( Math.log10( freq ) - minLog) );

      //console.log('Får vi ut något?', pos);
       //Amplitud - samma frekvensbars bygger på varandra
      // if ( pos > lastPos ) {
      this.analyserBars.push( {posX: pos, dataIdx: i, endIdx: 0, average: false, peak: 0, hold: 0, accel: 0 } );

    //  this.setState({analyserBars:
    //  [{posX: pos, dataIdx: i}]});
      console.log('posX: ', this.analyserBars.posX);

         lastPos = pos;
    //   }
    //   else if (analyserBars.length) {
      //   analyserBars[ analyserBars.length - 1 ].endIdx = i;
    //   }
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

    this.freqLabels.forEach( label => { label.posX = this.state.width * ( Math.log10( label.freq ) - minLog );
  		if ( label.freq >= 1000 )
  			label.freq = ( label.freq / 1000 ) + 'k';
  	});
  }


  draw() {
      const audioData = this.state.audioData;
      const canvas = this.canvas.current;
      const canvasCtx = canvas.getContext("2d");
      const barWidth = (this.state.width / this.bufferLength) * 10;

      let barHeight;
      let x = 0;
      let r, g, b;
      let bars = 118; // Set total number of bars you want per frame

      canvasCtx.fillRect( 0, 0, canvas.width, canvas.height );

    //  ctx.fillStyle = `rgba(0,0,0,0.2)`;
    //  ctx.clearRect(0, 0, this.state.width, this.state.height);

      const l = this.analyserBars.length;
      console.log('l = ', l);








/*
      r = 250;
      g = 0;
      b = 255;


      for (let i = 0; i < bars; i++) {
          barHeight = (audioData[i] * 2.5);


          if (audioData[i] > 210) {      // pink
              r = 250
              g = 0
              b = 255
          } else if (audioData[i] > 200) {  // yellow
              r = 250
              g = 255
              b = 0
          } else if (audioData[i] > 190) { // yellow/green
              r = 204
              g = 255
              b = 0
          } else if (audioData[i] > 180) { // blue/green
              r = 0
              g = 219
              b = 131
          } else if (audioData[i] < 150) { // light blue
              r = 0
              g = 199
              b = 255
          } else if (audioData[i] < 140) { // blue
              r = 0
              g = 12
              b = 255
          }


          canvasCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          canvasCtx.fillRect(x, (this.state.height - barHeight), this.state.width / bars, this.state.height);
          // (x, y, i, j)
          // (x, y) represents start point
          // (i, j) represents end point

          x += barWidth + 5; // Gives 10px space between each bar
      }*/
  }


  //---THE END OF TESTING NEW STUFF--------//

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

  analysis() {
    this.player = document.getElementById('player');
    this.audioCtx = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.track = this.audioCtx.createMediaElementSource(this.player);
    this.analyser = this.audioCtx.createAnalyser();
    this.track.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);


    // this.analyser.fftSize = 32;
    // this.analyser.fftSize = 64;
    // this.analyser.fftSize = 128;
    // this.analyser.fftSize = 256;
    //this.analyser.fftSize = 512;
    // this.analyser.fftSize = 1024;
    //this.analyser.fftSize = 2048;
    //this.analyser.fftSize = 4096;
    //this.analyser.fftSize = 8192;
    this.analyser.fftSize = 16384;
    //this.analyser.fftSize = 32768;

    this.preCalcPosX();

    this.bufferLength = this.analyser.frequencyBinCount;
    //console.log('bufferLength: ', this.bufferLength);
    this.dataArray = new Uint8Array(this.bufferLength);
    requestAnimationFrame(this.tick);
  }

  tick() {
    //console.log('tick()');
    if (!(this.state.paused)) {
      //console.log('tick() if');
      this.analyser.getByteFrequencyData(this.dataArray);
      this.setState({ audioData: this.dataArray });
      this.draw();
    }
    requestAnimationFrame(this.tick);

  }

  render() {
    let display = this.state.status ? { display: "block" } : { display: "none" };
    let displayButton = this.state.status ? { display: "none" } : { display: "block" };


    let content = (
      <div>
        <div onClick={this.trigger} style={displayButton}>Press to enter viz</div>

        <figure style={display}>
          <figcaption>Listen to Magic:</figcaption>
          <audio controls src={magicAudio} id="player" onPlay={this.handlePlay} onPause={this.handlePause}>
            Your browser does not support the
              <code>audio</code> element.
            </audio>
        </figure>
      </div>
    );


    return (
      <div className="App">
        <main>
          <header className="App-header">
            <div className="controls">
              {/*<AudioVisuliser audioData={this.state.audioData} bufferLength={this.bufferLength}/>*/}
              {content}
            </div>
          </header>
        </main>
      </div>
    );
  }
}
export default App;
