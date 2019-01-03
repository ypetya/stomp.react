import React, { Component } from "react";
import LatencyGraph from "./graphs/LatencyGraph";
import Stomp from "stompjs";
import YesNoVote from "./stomp-components/vote/YesNoVote";
import MultiUserButton from "./stomp-components/MultiUserButton";

const DEFAULT_WS_URL = "ws://localhost:3490";

class Layout extends Component {
  state = { websocket: null, connected:false };
  textInput = React.createRef();

  onConnect = () => {
    this.wsUrl = this.textInput.current.value;
    this.ws = new WebSocket(this.wsUrl);
    this.socket = Stomp.over(this.ws);

    this.ws.addEventListener('close',()=> {
      if(this.state.connected) {
        console.log('Connection should be up, reconnecting in 1 sec');
        setTimeout(this.onConnect, 1000);
      }
    });

    this.socket.connect(
      [],
      () => {
        this.setState({ websocket: this.socket, connected:true });
      }
    );
  };

  onDisconnect = () => {
    this.socket.disconnect(() => {
      this.setState({ websocket: null, connected: false }, () => {
        this.ws.close();
        this.ws = this.socket;
      });
    });
  };

  renderWidgets = () => <>
  <YesNoVote websocket={this.state.websocket}/>
  <MultiUserButton websocket={this.state.websocket}/>
   {/* <LatencyGraph websocket={this.state.websocket} /> */}
  </>

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
        {!!this.state.websocket ? this.renderWidgets() : (
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
