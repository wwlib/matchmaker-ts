import * as React from 'react';
import { render } from 'react-dom';
import Application from './components/Application';

import Director, { DirectorMode } from './matchmaker/Director';
import PlayerAccount from './matchmaker/PlayerAccount';
import Simulator from './simulator/Simulator';

let simulator = undefined; //new Simulator();

Director.Instance({ mode: DirectorMode.Primary, debug: true });
Director.Instance().addChatLobby();
Director.Instance().startConnectionManager();

render(
    <Application simulator={simulator}/>,
    document.getElementById('app')
);
