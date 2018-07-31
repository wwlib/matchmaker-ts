import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Client from './Client';
import Chart from './Chart';
import Simulator from '../simulator/Simulator';
import * as PubSubJS from 'pubsub-js';
import Director, { DirectorTopic } from '../matchmaker/Director';
import ClientProxy from '../matchmaker/ClientProxy';
import Lobby from '../matchmaker/game/Lobby';

const prettyjson = require('prettyjson');

export interface ApplicationProps { simulator: Simulator }
export interface ApplicationState { gameCount: number; stats: string }

export default class Application extends React.Component < ApplicationProps, ApplicationState > {

    public mockClient: ClientProxy;
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
                break;
            case 'addMockClient':
                this.mockClient = Director.Instance().addMockClient();
                break;
            case 'startSim':
                if (this.simulator) {
                    this.simulator.dispose();
                }
                this.simulator = new Simulator({deltaTime: 10});
                this.simulator.start();
                break;
            case 'stopSim':
                this.simulator.stop();
                break;
        }
    }

    render() {
        return(
            <div>
                <div>
                <ReactBootstrap.Button bsStyle={'info'} key={"getStats"} style = {{width: 120}}
                    onClick={this.onButtonClicked.bind(this, "getStats")}>getStats</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"addMockClient"} style = {{width: 120}}
                    onClick={this.onButtonClicked.bind(this, "addMockClient")}>addMockClient</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"startSim"} style = {{width: 120}}
                    onClick={this.onButtonClicked.bind(this, "startSim")}>startSim</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"stopSim"} style = {{width: 120}}
                    onClick={this.onButtonClicked.bind(this, "stopSim")}>stopSim</ReactBootstrap.Button>
                </div>
                <Client />
                <Chart />
            </div>
        );
    }
}
