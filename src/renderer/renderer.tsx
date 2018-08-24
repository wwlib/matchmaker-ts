import * as React from 'react';
import { render } from 'react-dom';
import Application from './components/Application';

import Director, { DirectorMode } from './matchmaker/Director';
import PubSub, { PubSubMode} from './matchmaker/PubSub';
import PlayerAccount from './matchmaker/PlayerAccount';
import Simulator from './simulator/Simulator';

let simulator = undefined; //new Simulator();

const argv = require('electron').remote.process.argv;
var argy = require('yargs')(argv).argv;

let options: any = {};
if (argy.mode && (argy.mode ==  DirectorMode.Primary || argy.mode ==  DirectorMode.Replica) ) {
    options.mode = argy.mode;
}
if (argy.connectionPort) {
    options.connectionPort = argy.connectionPort;
}
if (argy.debug) {
    options.debug = argy.debug;
}

Director.Instance(options);

let pubSubMode: PubSubMode = PubSubMode.PubSubJS;
if (argy.pubsub == 'redis') {
    pubSubMode = PubSubMode.Redis;
}
PubSub.Instance({ mode: pubSubMode, deltaTime: 10 });


let clientPort: number = Director.Instance().connectionPort;
let clientMode: boolean = false;
if (argy.client) { // don't start the connection manager if running as a client only
    clientMode = true;
    if (argy.clientPort) {
        clientPort = argy.clientPort;
    }
    console.log(`starting as client using port: ${clientPort}`);
} else {
    Director.Instance().startConnectionManager();
    Director.Instance().addChatLobby();
    Director.Instance().addAstroGame({ connectionPort: 9494 });
}


render(
    <Application simulator={simulator} clientMode={clientMode} clientPort={clientPort}/>,
    document.getElementById('app')
);
