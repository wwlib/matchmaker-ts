import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Client from './Client';
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
            case 'addMockClient':
                this.mockClient = Director.Instance().addMockClient();
                break;
            case 'addLobby':
                // this.lobby = Director.Instance().addLobby();
                break;
            case 'sendClientMsg':
                this.mockClient.sendMessageToGameWorld('hello to the lobby');
                break;
            case 'sendLobbyMsg':
                this.lobby.broadcast('hello from the lobby');
                break;
            case 'stats':
                if (this.props.simulator) {
                    let stats: any =  this.props.simulator.json;
                    let statsString: string = prettyjson.render(stats, {noColor: true});
                    this.setState({gameCount: stats.gameCount, stats: statsString});
                }
                break;
            case 'requestLobby':
                PubSubJS.publish(DirectorTopic.Lobby, { director: Director.Instance().uuid }); //, { director: Director.Instance().uuid }
                break;
        }
    }

    render() {
        return(
            <div>
                <div>
                <ReactBootstrap.Button bsStyle={'success'} key={"addGame"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "addGame")}>addGame</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"addMockClient"} style = {{width: 120}}
                    onClick={this.onButtonClicked.bind(this, "addMockClient")}>addMockClient</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"addLobby"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "addLobby")}>addLobby</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"sendClientMsg"} style = {{width: 120}}
                    onClick={this.onButtonClicked.bind(this, "sendClientMsg")}>sendClientMsg</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"sendLobbyMsg"} style = {{width: 120}}
                    onClick={this.onButtonClicked.bind(this, "sendLobbyMsg")}>sendLobbyMsg</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"stats"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "stats")}>stats</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"requestLobby"} style = {{width: 120}}
                    onClick={this.onButtonClicked.bind(this, "requestLobby")}>requestLobby</ReactBootstrap.Button>
                </div>
                <Client />
                <textarea name="stats" value={this.state.stats} style={{width: 800, height: 400}}/>

            </div>
        );
    }
}
