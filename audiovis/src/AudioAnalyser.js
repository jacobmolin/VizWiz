import React, { Component } from 'react';


class AudioAnalyser extends Component {

    constructor(props) {
        super(props);
        this.state = { audioData: new Uint8Array(0) };
        this.tick = this.tick.bind(this);
    }

    componentDidMount() {
        this.audioCtx = new (window.AudioContext ||
            window.webkitAudioContext)();
        this.analyser = this.audioCtx.createAnalyser();
        this.bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(this.bufferLength);
        this.src = this.audioCtx.createMediaStreamSource(this.props.audio);
        this.src.connect(this.analyser);
        this.rafId = requestAnimationFrame(this.tick);
    }

    tick() {
        this.analyser.getByteTimeDomainData(this.dataArray);
        this.setState({ audioData: this.dataArray });
        this.rafId = requestAnimationFrame(this.tick);
    }

    componentWillUnmount() {
        cancelAnimationFrame(this.rafId);
        this.analyser.disconnect();
        this.src.disconnect();
    }

    render() {
        return <textarea value={this.state.audioData} />;
    }

}

export default AudioAnalyser;