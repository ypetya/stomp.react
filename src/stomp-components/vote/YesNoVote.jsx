import React, { Component } from 'react';

class YesNoVote extends Component {
    
    state = { isMaster: true }
    me = Math.random();

    componentDidMount = () => {
        const { websocket } = this.props;
        websocket.subscribe('votes/command',
            m => {
                const msg = JSON.parse(m.body);

                if (msg.from !== this.me && this.state.isMaster) {
                    if (this.timer) clearInterval(this.timer);
                    this.setState({ isMaster: false });
                }
            });

        this.timer = setInterval(() => {

            websocket.send('votes/command', {}, JSON.stringify({
                from: this.me
            }));

        }, 2000);
    }

    renderChart = () => <>
        <input type="text" defaultValue="Enter survey text here..." />
        <button>Ask Question</button>
        <button>Reset votes</button>
    </>;

    render = () =>
        this.state.isMaster ? this.renderChart() :
            <>
                <button>YES</button>
                <button>NO</button>
            </>

}

export default YesNoVote;