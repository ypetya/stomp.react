import React, { Component } from "react";

import "./LatencyGraph.css";

const DATA_MAX_SIZE = 100;
const TICK = 1000;

const VIEWBOX_X = 1000;
const VIEWBOX_Y = 1000;
const MARGIN = 50;

class LatencyGraph extends Component {
  state = {
    data: []
  };
  componentDidMount = () => {
    const { websocket } = this.props;

    this.rnd = Math.floor(Math.random() * 10000);

    websocket.subscribe(`/latency-check/${this.rnd}`, m => {
      const delta = Date.now() - Number(m.headers.ts);
      this.setState(() => {
        const { data } = this.state;
        if (data.length >= DATA_MAX_SIZE) data.shift();
        data.push(delta);
        return { data };
      });
    });

    this.timer = setInterval(() => {
      websocket.send(
        `/latency-check/${this.rnd}`,
        { ts: Date.now() },
        `hello ${this.rnd}`
      );
    }, TICK);
  };
  componentWillUnmount = () => {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  };
  normalizePoints() {
    let min = Infinity,
      max = -Infinity;
    const { data } = this.state;
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      if (d < min) min = d;
      if (d > max) max = d;
    }

    if (min === 0) min = 1;

    const range = max - min;
    this.max = max;
    this.min = min;
    if (range > 1 && data.length > 0) {
      const dx = (MARGIN * 2 + VIEWBOX_X) / (DATA_MAX_SIZE + 1);
      const points = [];
      for (let i = 0; i < data.length; i++) {
        points.push(
          [
            MARGIN + i * dx,
            VIEWBOX_Y -
              MARGIN -
              ((VIEWBOX_Y - MARGIN * 2) * (data[i] - min)) / range
          ].join(",")
        );
      }

      return points.join(" ");
    } else {
      return "0,0";
    }
  }
  renderY() {
    const sticks = [];
    const from = MARGIN;
    const to = VIEWBOX_Y - MARGIN;
    const dy = (VIEWBOX_Y - MARGIN * 2) / 10;
    const denorm = d =>
      Math.round((d / (VIEWBOX_Y - MARGIN * 2)) * (this.max - this.min));
    for (let y = from; y <= to; y += dy) {
      sticks.push(
        <line
          key={`l_${y}`}
          x1={MARGIN / 2}
          x2={MARGIN}
          y1={y}
          y2={y}
          stroke="gray"
        />
      );
      sticks.push(
        <text key={`t_${y}`} x="0" y={y}>
          {denorm(to - y)} ms
        </text>
      );
    }

    return (
      <g className="grid-y">
        <line
          x1={MARGIN}
          x2={MARGIN}
          y1={MARGIN / 2}
          y2={VIEWBOX_Y - MARGIN / 2}
          stroke="gray"
        />
        {sticks}
      </g>
    );
  }
  render() {
    const points = this.normalizePoints();
    return (
      <div className="Graph">
        <header className="Graph-header">Latency</header>
        <main>
          <svg
            viewBox={`0 0 ${VIEWBOX_X} ${VIEWBOX_Y}`}
            className="latencyGraph"
          >
            {this.renderY()}
            <polyline
              fill="none"
              stroke="blue"
              strokeWidth="3"
              points={points}
            />
          </svg>
        </main>
      </div>
    );
  }
}

export default LatencyGraph;
