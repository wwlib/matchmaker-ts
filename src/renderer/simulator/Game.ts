import Player from './Player';
import PlayerAccount from '../matchmaker/PlayerAccount';
import { PlayerAction } from './Player';
import { EventEmitter } from 'events';

const uuidv1 = require('uuid/v1');

export enum GameState {
    Waiting,
    Playing,
    Done,
    Aborted
}

export interface GameOptions {
    maxDuration: number; // (ms) the game will last this long if no team quits
    maxWaitTime: number;
    minPlayers: number;
    maxPlayers: number;
}

export default class Game extends EventEmitter {

    public uuid: string;
    public maxDuration: number; // (ms) the game will last this long if no team quits
    public maxWaitTime: number;
    public minPlayers: number;
    public maxPlayers: number;
    public players: Map<PlayerAccount, Player> = new Map<PlayerAccount, Player>();
    public state: GameState;


    private _spawnTime: number;
    private _startTime: number;
    private _currentSecond: number;

    constructor(options?: GameOptions) {
        super();
        options = options || { maxDuration: 10000, maxWaitTime: 10000, minPlayers: 2, maxPlayers: 2};
        this.uuid = uuidv1();
        this.maxDuration = options.maxDuration;
        this.maxWaitTime = options.maxWaitTime;
        this.minPlayers = options.minPlayers;
        this.maxPlayers = options.maxPlayers;
        this.state = GameState.Waiting;
        this._spawnTime = performance.now();
        process.nextTick(() => {
            this.emit('spawned', {uuid: this.uuid})
        });
    }

    addPlayer(player: Player): void {
        if (this.players.size < this.maxPlayers) {
            this.players.set(player.account, player);
            this.emit('player-added', {uuid: this.uuid, account: player.account});
        }
    }

    removePlayer(player: Player): void {
        this.players.delete(player.account);
        this.emit('player-removed', {uuid: this.uuid, action: player.action, account: player.account});
    }

    start(): boolean {
        if ((this.players.size == this.maxPlayers) || ((this.players.size >= this.minPlayers) && this.waitTime >= this.maxWaitTime)) {
            this._startTime = performance.now();
            this._currentSecond = 0;
            return true;
        } else {
            return false;
        }
    }

    tick(): void {
        let elapsedTime: number = performance.now() - this._startTime;
        let percentElapsedTime: number = elapsedTime/this.maxDuration;
        let second: number = Math.floor(elapsedTime/1000);
        if (second > this._currentSecond) {
            this._currentSecond = second;
            console.log(`Game: ${this.uuid}: Second: ${this._currentSecond}`);
        }
        if (this.state == GameState.Waiting) {
            if (this.start()) {
                this.state = GameState.Playing;
                this.emit('started', {uuid: this.uuid});
                this.playersStart();
            } else {
                this.playersWait();
            }
        } else if (this.state == GameState.Playing) {
            this.play(percentElapsedTime);
        }
    }

    play(percentElapsedTime: number): void {
        if (this.players.size < this.minPlayers) {
            this.state = GameState.Aborted;
            this.emit('done', {uuid: this.uuid, state: "Aborted", elapsed: percentElapsedTime});
        } else if (performance.now() - this._startTime < this.maxDuration) {
            this.state = GameState.Playing;
            // console.log(`Game: play: percentElapsedTime: ${percentElapsedTime}`);
            this.playersPlay(percentElapsedTime);
        } else {
            this.state = GameState.Done;
            this.emit('done', {uuid: this.uuid, state: "Done", elapsed: percentElapsedTime});
        }
    }

    playersWait(): void {
        this.players.forEach((player: Player, account: PlayerAccount) => {
            let elapsedTime: number = performance.now() - this._spawnTime;
            let percentElapsedTime: number = elapsedTime/player.maxWaitTime;
            let playerAction: PlayerAction = player.wait(percentElapsedTime);
            if (playerAction == PlayerAction.Bail) {
                this.removePlayer(player);
            }
        });
    }

    playersStart(): void {
        this.players.forEach((player: Player, account: PlayerAccount) => {
            player.start();
        });
    }

    playersPlay(percentElapsedTime: number): void {
        this.players.forEach((player: Player, account: PlayerAccount) => {
            let playerAction: PlayerAction = player.play(percentElapsedTime);
            if (playerAction == PlayerAction.Quit) {
                this.removePlayer(player);
            }
        });
    }

    get waitTime(): number {
        return performance.now() - this._spawnTime;
    }

}
