// import PubSub from '../PubSub';
import Director, { DirectorTopic } from '../Director';
import GameWorld, { GameWorldType, GameWorldState } from './GameWorld';
import Lobby, { LobbyOptions } from './Lobby';
import ClientProxy from '../ClientProxy';
import PlayerAccount, { PlayerLocation } from '../PlayerAccount';
import Database from '../Database';

const now = require("performance-now");

export default class MockGame extends GameWorld {

    public maxTime: number = 3000;

    private _startTime: number;

    constructor(options?: any) {
        super(options);
        this.start();
    }

    tick(): number {
        this.startTick();
        if ((now() - this._startTime) >= this.maxTime) {
            let clients: ClientProxy[] = Array.from(this._clients.values());
            this.dispose();
            Director.Instance().handleMockGameOver(this, clients[0], clients[1]);
        }
        this.endTick();
        return 0;
    }

    start(): void {
        this._startTime = now();
    }

    dispose(): void {
        super.dispose();
    }
}
