import React, { Component } from "react";
import LatencyGraph from "./LatencyGraph";
import Stomp from "stompjs";

const DEFAULT_WS_URL = "ws://localhost:3490";

class Layout extends Component {
  state = { websocket: null };
  textInput = React.createRef();

  onConnect = () => {
    this.wsUrl = this.textInput.current.value;
    this.ws = new WebSocket(this.wsUrl);
    this.socket = Stomp.over(this.ws);

    this.socket.connect(
      [],
      () => {
        this.setState({ websocket: this.socket });
      }
    );
  };

  onDisconnect = () => {
    this.socket.disconnect(() => {
      this.setState({ websocket: null }, () => {
        this.ws.close();
        this.ws = this.socket;
      });
    });
  };

  render = () => (
    <>
      <header>
        <input ref={this.textInput} type="text" defaultValue={DEFAULT_WS_URL} />
        <button onClick={this.onConnect} disabled={!!this.state.websocket}>
          Connect
        </button>
        <button onClick={this.onDisconnect} disabled={!this.state.websocket}>
          Disconnect
        </button>
      </header>
      <main>
        {!!this.state.websocket ? (
          <LatencyGraph websocket={this.state.websocket} />
        ) : (
          "Nothing to see here"
        )}
      </main>
    </>
  );

  componentWillUnmount = () => {
    if (this.ws) {
      this.ws.close();
      this.ws = this.socket = null;
    }
  };
}

export default Layout;
