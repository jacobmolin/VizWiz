import React, { Component } from 'react';
import './App.css';
import magicAudio from './resources/Magic - Coldplay.mp3';
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
      width: 1280,
      height: 640
      //analyserBars: [ {posX: 0, dataIdx: 0, endIdx: 0, average: false, peak: 0, hold: 0, accel: 0 } ]

    };
    this.trigger = this.trigger.bind(this);
    this.analysis = this.analysis.bind(this);
    this.tick = this.tick.bind(this);
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.preCalcPosX = this.preCalcPosX.bind(this);
    this.draw = this.draw.bind(this);
    this.canvas = React.createRef();

    this.barData = null;
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

  //----Analys-----//
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

    //sparar analyserBars från precalcX i barData
    //barData bestämmer x-axeln som en array
    this.barData = this.preCalcPosX();

    this.bufferLength = this.analyser.frequencyBinCount;
    //skapar array med bufferLength´s många tomma platser
    this.dataArray = new Uint8Array(this.bufferLength);
    requestAnimationFrame(this.tick);
  }


    //---TESTING NEW STUFF--------//
    preCalcPosX() {

      const minFreq = this.state.minFreq;
      const maxFreq = this.state.maxFreq;
      const width = this.state.width;
      const fftSize = this.analyser.fftSize;
      const sampleRate = this.audioCtx.sampleRate;
      const frequencyBinCount = this.analyser.frequencyBinCount;

      let i, freq;
        const minLog = Math.log10( minFreq );
        const bandWidth = width / ( Math.log10( maxFreq ) - minLog );

      this.barWidth = 1;
      let analyserBars = [], pos,
          lastPos = -1,
          minIndex = Math.floor( minFreq * fftSize / sampleRate ),
          maxIndex = Math.min( Math.round( maxFreq * fftSize / sampleRate ), frequencyBinCount - 1 );

      for ( i = minIndex; i <= maxIndex; i++) {
        freq = i * sampleRate / fftSize;
        pos = Math.round( bandWidth * ( Math.log10( freq ) - minLog) );

        //  console.log('Får vi ut posX:?', pos);

         //Amplitud - samma frekvensbars bygger på varandra
        if ( pos > lastPos ) {
          analyserBars.push({posX: pos, dataIdx: i, endIdx: 0, average: false, peak: 0, hold: 0, accel: 0 } );
          lastPos = pos;
           //console.log('if :', analyserBars[analyserBars.length-1].posX);
         }
         else if (analyserBars.length) {
           analyserBars[ analyserBars.length - 1 ].endIdx = i;
            //console.log('else if : ', analyserBars[analyserBars.length-1].posX);
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

       freqLabels.forEach( label => { label.posX = width * ( Math.log10( label.freq ) - minLog );
        if ( label.freq >= 1000 )
          label.freq = ( label.freq / 1000 ) + 'k';
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
      const l = this.barData.length;
      let bar;
      let barHeight = 0;
      canvasCtx.fillStyle = 'black';


      /*let gradients = {
        prism:   {
      		bgColor: '#111',
      		colorStops: [
      			'hsl( 0, 80%, 50% )',
      			'hsl( 60, 80%, 50% )',
      			'hsl( 120, 80%, 50% )',
      			'hsl( 180, 80%, 50% )',
      			'hsl( 240, 80%, 50% )',
      		]
      	},
      }*/

      //clear canvas
      canvasCtx.fillRect( 0, 0, canvas.width, canvas.height );

      for(let i = 0; i < l; i++) {
        bar = this.barData[i];

        if (bar.endIdx == 0) { // single FFT bin
          barHeight = audioData [bar.dataIdx]
        }
        else { 	// range of bins
          barHeight = 0;
          if( bar.average) {
            //use the average value of the range
            for(let j = bar.dataIdx; j <= bar.endIdx; j++)
            {
              barHeight += audioData[j];
              barHeight = barHeight / (bar.endIdx -  bar.dataIdx + 1);
            }
          }
          else {
            //use the highest value in the range
            for(let j = bar.dataIdx; j <= bar.endIdx; j++) {
              barHeight = Math.max(barHeight, audioData [j]);
            }
          }
        }

        //---isLedDisplay---//
        /*if ( isLedDisplay ) // normalize barHeight to match one of the "led" elements
          barHeight = ( barHeight / 255 * ledOptions.nLeds | 0 ) * ( ledOptions.ledHeight + ledOptions.spaceV );
        else
          barHeight = barHeight / 255 * canvas.height | 0;*/

        //--PEAK--//
        if (barHeight >= bar.peak) {
          bar.peak = barHeight;
          bar.hold = 30; //set peak hold time to 30 frames (0,5s since 60frames/sek)
          bar.accel = 0;
        }

        canvasCtx.fillStyle = 'orange';
        //if ( isLedDisplay )
        //  canvasCtx.fillRect( bar.posX + ledOptions.spaceH / 2, canvas.height, barWidth, -barHeight );
        //else
        canvasCtx.fillRect( bar.posX, canvas.height, this.barWidth, -barHeight );
      }





/*
      let barHeight;
      let x = 0;
      let r, g, b;
      let bars = 118; // Set total number of bars you want per frame

;

    //  ctx.fillStyle = `rgba(0,0,0,0.2)`;
    //  ctx.clearRect(0, 0, this.state.width, this.state.height);

      const l = this.analyserBars.length;
      console.log('l = ', l);
*/



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








  render() {
    let display = this.state.status ? { display: "block" } : { display: "none" };
    let displayButton = this.state.status ? { display: "none" } : { display: "block" };


    let content = (
      <div>
        <div onClick={this.trigger} style={displayButton}>Press to enter viz</div>

        <div style={display}>
          <canvas width={this.state.width} height={this.state.height} ref={this.canvas} />
            <figure>
            <figcaption>Listen to Magic:</figcaption>
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
