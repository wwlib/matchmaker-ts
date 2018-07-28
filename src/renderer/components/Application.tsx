import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Simulator from '../simulator/Simulator';

const prettyjson = require('prettyjson');

export interface ApplicationProps { simulator: Simulator }
export interface ApplicationState { gameCount: number; stats: string }

export default class Application extends React.Component < ApplicationProps, ApplicationState > {

    componentWillMount() {
        this.setState({ gameCount: 0, stats: '' });
    }

    componentDidMount() {
    }

    onButtonClicked(action: string): void {
        // console.log(`onButtonClicked: ${action}`);
        switch (action) {
            case 'addGame':
                break;
            case 'addPlayer':
                break;
            case 'addLobby':
                break;
            case 'stats':
                let stats: any =  this.props.simulator.json;
                console.log(stats);
                let statsString: string = prettyjson.render(stats, {noColor: true});
                console.log(statsString);

                this.setState({gameCount: stats.gameCount, stats: statsString})
                break;
        }
    }

    render() {
        return(
            <div>
                <div>
                <ReactBootstrap.Button bsStyle={'success'} key={"addGame"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "addGame")}>addGame</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"addPlayer"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "addPlayer")}>addPlayer</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"addLobby"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "addLobby")}>addLobby</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"stats"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "stats")}>stats</ReactBootstrap.Button>
                </div>

                <textarea name="stats" value={this.state.stats} style={{width: 800, height: 500}}/>

            </div>
        );
    }
}
