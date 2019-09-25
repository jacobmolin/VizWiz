import React, { Component } from 'react';

class AudioVisuliser extends Component {


    constructor(props) {
        super(props);
        this.canvas = React.createRef();
        this.state = {
            WIDTH: 1200,
            HEIGHT: 700
        }
    }

    componentDidUpdate() {
        this.draw();
    }

    draw() {
        const audioData = this.props.audioData;
        const canvas = this.canvas.current;
        const ctx = canvas.getContext("2d");
        console.log('canvas.width: ', this.canvas.height, 'canvas.height: ', this.canvas.width);
        console.log('this.state.WIDTH: ', this.state.WIDTH, 'this.state.HEIGHT: ', this.state.HEIGHT);
        console.log('props.bufferLength: ', this.props.bufferLength);
        const barWidth = (this.state.WIDTH / this.props.bufferLength) * 10;
        console.log('barWidth: ', barWidth);
        console.log('TOTAL WIDTH: ', (117 * 10) + (118 * barWidth));

        let barHeight;
        let x = 0;
        let r, g, b;
        let bars = 118; // Set total number of bars you want per frame



        ctx.fillStyle = `rgba(0,0,0,0.2)`;
        ctx.clearRect(0, 0, this.state.WIDTH, this.state.HEIGHT);

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
            */

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(x, (this.state.HEIGHT - barHeight), this.state.WIDTH / bars, this.state.HEIGHT);
            // (x, y, i, j)
            // (x, y) represents start point
            // (i, j) represents end point

            x += barWidth + 10; // Gives 10px space between each bar
        }
    }

    render() {
        return <canvas width={this.state.WIDTH} height={this.state.HEIGHT} ref={this.canvas} />
    }
}

export default AudioVisuliser;
