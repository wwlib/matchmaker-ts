import PlayerAccount from '../matchmaker/PlayerAccount';
import Database from '../matchmaker/Database';
import Director from '../matchmaker/Director';


export type SimulatorOptions = {
	deltaTime?: number;
}

export default class Simulator {

    protected _deltaTime: number;
    private _tickInterval: any;
    private _tickHandler: any = this.tick.bind(this);

    constructor( options?: SimulatorOptions) {
        options = options || {};
        let defaultOptions: SimulatorOptions =  {
            deltaTime: 1000,
        }
		options = Object.assign(defaultOptions, options);
        this._deltaTime = options.deltaTime;
    }

    get json(): any {
        let json: any = {};
        return json;
    }

    tick(): void {
		Director.Instance().addMockClients(100);
		console.log(Director.Instance().getPerformanceStats());
    }

    start(): void {
        this._tickInterval = setInterval(this._tickHandler, this._deltaTime);
    }

    stop(): void {
        clearInterval(this._tickInterval);
    }

	dispose(): void {
		this.stop();
		this._tickHandler = undefined;
	}

    set deltaTime(deltaTime: number) {
        this._deltaTime = deltaTime;
    }
}
