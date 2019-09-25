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
      paused: true
    };
    this.trigger = this.trigger.bind(this);
    this.analysis = this.analysis.bind(this);
    this.tick = this.tick.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
  }

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
    // this.analyser.fftSize = 512;
    // this.analyser.fftSize = 1024;
    // this.analyser.fftSize = 2048;
    // this.analyser.fftSize = 4096;
    // this.analyser.fftSize = 8192;
    this.analyser.fftSize = 16384;
    // this.analyser.fftSize = 32768;

    this.bufferLength = this.analyser.frequencyBinCount;
    console.log('bufferLength: ', this.bufferLength);
    this.dataArray = new Uint8Array(this.bufferLength);
    requestAnimationFrame(this.tick);
  }

  tick() {
    if (!(this.state.paused)) {
      this.analyser.getByteFrequencyData(this.dataArray);
      this.setState({ audioData: this.dataArray });
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
              <AudioVisuliser audioData={this.state.audioData} bufferLength={this.bufferLength} />
              {content}
            </div>
          </header>
        </main>
      </div>
    );
  }
}
export default App;
