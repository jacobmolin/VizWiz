import React, { Component } from 'react';

class AudioVisuliser extends Component {


    constructor(props) { //WIDTH 1200, HEIGHT 700
        super(props);     //or 640 x 270
        this.canvas = React.createRef();
        this.state = {
          //mode        : 0,
          //fftSize     : 8192,
          //minFreq     : 20,
          //maxFreq     : 22000,
          //smoothing   : 0.5,
          //gradient    : 'classic',
          //minDb       : -85,
          //maxDb       : -25,
          //showBgColor : true,
          //showLeds    : false,
          //showScale   : true,
          //showPeaks   : true,
          //showFPS     : false,
          //loRes       : false,*/
          idth       : 640,
          height      : 270
        }
    }

    //----TEST--------//





    //---TEST END--////

    componentDidUpdate() {
        this.draw();
    }

    /*
    draw() {
        const audioData = this.props.audioData;
        const canvas = this.canvas.current;
        const ctx = canvas.getContext("2d");
        const barWidth = (this.state.width / this.props.bufferLength) * 10;

        let barHeight;
        let x = 0;
        let r, g, b;
        let bars = 118; // Set total number of bars you want per frame



        ctx.fillStyle = `rgba(0,0,0,0.2)`;
        ctx.clearRect(0, 0, this.state.width, this.state.height);

        r = 250;
        g = 0;
        b = 255;

        for (let i = 0; i < bars; i++) {
            barHeight = (audioData[i] * 2.5);

            /*
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
            

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, (this.state.height - barHeight), this.state.width / bars, this.state.height);
            // (x, y, i, j)
            // (x, y) represents start point
            // (i, j) represents end point

            x += barWidth + 5; // Gives 10px space between each bar
        }
    }
    */

    render() {
        return <canvas width={this.state.width} height={this.state.height} ref={this.canvas} />
    }
}

export default AudioVisuliser;
