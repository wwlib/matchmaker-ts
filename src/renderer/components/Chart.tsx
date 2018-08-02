import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import Director from '../matchmaker/Director';
// import { Line } from 'react-chartjs-2';
// import 'chartjs-plugin-streaming';

import { LineChart } from 'react-easy-chart';

const now = require("performance-now");

export interface ChartProps { }
export interface ChartState { componentWidth: number, randomDataIntervalId: any, yDomain: number }

export default class Chart extends React.Component<ChartProps, ChartState> {

    public data: any;
    public nextX: number;
    private _updateDataHndler: any = this.updateData.bind(this);
    private _startTime: number;

    componentWillMount() {
        this.resetData();
        this.setState({ componentWidth: 800, yDomain: 100 });
    }

    turnOnDataStream() {
        this._startTime = now();
        // this.resetData();
        this.setState({ randomDataIntervalId: setInterval(this._updateDataHndler, 200) });
    }

    turnOffDataStream() {
        clearInterval(this.state.randomDataIntervalId);
    }

    getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    resetData() {
        this.data  = [
            [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 20, y: 0 },
                { x: 30, y: 0 },
                { x: 40, y: 0 },
                { x: 50, y: 0 },
                { x: 60, y: 0 },
                { x: 70, y: 0 },
                { x: 80, y: 0 },
                { x: 90, y: 0 },
                { x: 100, y: 0 }
            ], [
                { x: 0, y: 0 },
                { x: 10, y: 0 },
                { x: 20, y: 0 },
                { x: 30, y: 0 },
                { x: 40, y: 0 },
                { x: 50, y: 0 },
                { x: 60, y: 0 },
                { x: 70, y: 0 },
                { x: 80, y: 0 },
                { x: 90, y: 0 },
                { x: 100, y: 0 }
            ]
        ];
        this.nextX = 110;
    }

    updateData() {
        // this.data.forEach((data) => {
        //     data.shift();
        //     let y = this.getRandomArbitrary(
        //         data[data.length - 1].y - 20,
        //         data[data.length - 1].y + 20);
        //     if (y < 0 || y > 100) y = data[data.length - 1].y;
        //     data.push({ x: data[data.length - 1].x + 10, y });
        // });

        let elapsedTime = now() - this._startTime;
        let performanceData: any = Director.Instance().getPerformanceStats();
        this.data[0].shift();
        this.data[0].push({x: this.nextX, y: performanceData.lobbies});
        this.data[1].shift();
        this.data[1].push({x: this.nextX, y: performanceData.clients});
        this.nextX += 10;

        this.setState({ yDomain: Math.max(this.state.yDomain, performanceData.clients) });
        this.forceUpdate();
    }

    onButtonClicked(action: string): void {
        // console.log(`onButtonClicked: ${action}`);
        switch (action) {
            case 'on':
                this.turnOnDataStream();
                break;
            case 'off':
                this.turnOffDataStream();
                break;
            case 'step':
                this.updateData();
                break;
        }
    }

    render() {
        return (
            <div>
                <LineChart
                    data={this.data}
                    width={this.state.componentWidth}
                    height={this.state.componentWidth / 2}
                    axisLabels={{ x: 'x', y: 'y' }}
                    interpolate={'cardinal'}
                    yDomainRange={[0, this.state.yDomain]}
                    axes
                    grid
                    style={{
                        '.line0': {
                            stroke: 'green'
                        }
                    }}
                />
                <ReactBootstrap.Button bsStyle={'info'} key={"on"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "on")}>on</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"off"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "off")}>off</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"step"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "step")}>step</ReactBootstrap.Button>
            </div>
        );
    }
}

/*
<Line
    data={{
        datasets: [{
            label: 'Dataset 1',
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            lineTension: 0,
            borderDash: [8, 4]
        }, {
            label: 'Dataset 2',
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            data: [{x: 100, y: 50}, {x: 200, y: 150}, {x: 300, y: 50}, {x: 400, y: 50}]
        }]
    }}

    options={{
        plugins: {
            streaming: {
                onRefresh: function(chart) {
                    chart.data.datasets.forEach(function(dataset) {
                        dataset.data.push({
                            x: Date.now(),
                            y: Math.random()
                        });
                    });
                },
                delay: 2000
            }
        }
    }}
/>
*/
