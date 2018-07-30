import * as React from 'react';
import { render } from 'react-dom';
import Application from './components/Application';

import Director, { DirectorMode } from './matchmaker/Director';
import Simulator from './simulator/Simulator';

let simulator = undefined; //new Simulator();

Director.Instance({ mode: DirectorMode.Primary });
Director.Instance().addLobby();

render(
    <Application simulator={simulator}/>,
    document.getElementById('app')
);
