import * as React from 'react';
import { render } from 'react-dom';
import Application from './components/Application';

import Simulator from './simulator/Simulator';

let simulator = new Simulator();

render(
    <Application simulator={simulator}/>,
    document.getElementById('app')
);
