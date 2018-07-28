import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Simulator from '../simulator/Simulator';

export interface ApplicationProps { simulator: Simulator }
export interface ApplicationState { games: number }

export default class Application extends React.Component < ApplicationProps, ApplicationState > {

    componentWillMount() {
        this.setState({ games: 0 });
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
                let stats: any =  this.props.simulator.getStats();
                console.log(stats);
                this.setState({games: stats.games})
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
                <div>
                    <p>Games: {this.state.games}</p>
                </div>

            </div>
        );
    }
}
