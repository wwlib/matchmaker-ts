import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Client from './Client';
import Chart from './Chart';
import Simulator from '../simulator/Simulator';
import Director, { DirectorTopic } from '../matchmaker/Director';
import PubSub from '../matchmaker/PubSub';
import ClientProxy from '../matchmaker/ClientProxy';
import Lobby from '../matchmaker/game/Lobby';

const prettyjson = require('prettyjson');

export interface ApplicationProps { simulator: Simulator, clientMode: boolean, clientPort: number }
export interface ApplicationState { gameCount: number; stats: string }

export default class Application extends React.Component < ApplicationProps, ApplicationState > {

    public lobby: Lobby;
    public simulator: Simulator;

    componentWillMount() {
        this.setState({ gameCount: 0, stats: '' });
    }

    componentDidMount() {
    }

    onButtonClicked(action: string): void {
        // console.log(`onButtonClicked: ${action}`);
        switch (action) {
            case 'getStats':
                console.log(Director.Instance().getPerformanceStats());
                console.log(PubSub.Instance().getPerformanceStats());
                break;
            case 'addMockClient':
                Director.Instance().addMockClients(100);
                console.log(Director.Instance().getPerformanceStats());
                break;
            case 'tick':
                Director.Instance().tick();
                console.log(Director.Instance().getPerformanceStats());
                console.log(PubSub.Instance().getPerformanceStats());
                break;
            case 'start':
                Director.Instance().start();
                break;
            case 'stop':
                Director.Instance().stop();
                break;
            case 'startSim':
                if (this.simulator) {
                    this.simulator.dispose();
                }
                this.simulator = new Simulator({deltaTime: 1000});
                this.simulator.start();
                break;
            case 'stopSim':
                this.simulator.stop();
                break;
        }
    }

    controls() {
        return (
            <div>
            <ReactBootstrap.Button bsStyle={'info'} key={"getStats"} style = {{width: 120}}
                onClick={this.onButtonClicked.bind(this, "getStats")}>getStats</ReactBootstrap.Button>
            <ReactBootstrap.Button bsStyle={'info'} key={"addMockClient"} style = {{width: 120}}
                onClick={this.onButtonClicked.bind(this, "addMockClient")}>addMockClients</ReactBootstrap.Button>
            <ReactBootstrap.Button bsStyle={'info'} key={"tick"} style = {{width: 120}}
                onClick={this.onButtonClicked.bind(this, "tick")}>tick</ReactBootstrap.Button>
            <ReactBootstrap.Button bsStyle={'info'} key={"start"} style = {{width: 120}}
                onClick={this.onButtonClicked.bind(this, "start")}>start</ReactBootstrap.Button>
            <ReactBootstrap.Button bsStyle={'info'} key={"stop"} style = {{width: 120}}
                onClick={this.onButtonClicked.bind(this, "stop")}>stop</ReactBootstrap.Button>
            <ReactBootstrap.Button bsStyle={'info'} key={"startSim"} style = {{width: 120}}
                onClick={this.onButtonClicked.bind(this, "startSim")}>startSim</ReactBootstrap.Button>
            <ReactBootstrap.Button bsStyle={'info'} key={"stopSim"} style = {{width: 120}}
                onClick={this.onButtonClicked.bind(this, "stopSim")}>stopSim</ReactBootstrap.Button>
            </div>
        )
    }

    render() {
        return(
            <div>
                {this.props.clientMode ? null : this.controls()}
                <Client port={this.props.clientPort}/>
                {this.props.clientMode ? null : <Chart />}
            </div>
        );
    }
}
