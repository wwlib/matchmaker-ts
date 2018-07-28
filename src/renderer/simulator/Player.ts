// players want to play games with good teammates and opponents
// players are grouped into lobbies to facilitate matchmaking
// players wait until an appropriate game/team combo is available
// players are picky about joining games
// players get less picky the longer they wait
// quitting can be poor sportsmanship
// players generally don't want to play with quitters/cheaters

import PlayerAccount from '../matchmaker/PlayerAccount';

export enum PlayerAction {
    Wait,
    Bail,
    Play,
    Quit,
}

export interface PlayerOptions {
    maxWaitTime: number;
    bailProbability: number;
    quitProbability: number;
}

export default class Player {

    public account: PlayerAccount;
    public maxWaitTime: number;
    public bailProbability: number;
    public quitProbability: number;
    public action: PlayerAction;
    public ticks: number;

    private _spawnTime: number;
    private _startTime: number;

    constructor(account: PlayerAccount, options?: any) {
        options = options || {};
        let defaultOptions: PlayerOptions =  {
            maxWaitTime: 3000,
            bailProbability: 0.01,
            quitProbability: 0.01
        }
        options = Object.assign(defaultOptions, options);

        this.maxWaitTime = options.maxWaitTime;
        this.bailProbability = options.bailProbability;
        this.quitProbability = options.quitProbability;
        this.account = account;
        this.action = PlayerAction.Wait;
        this.ticks = 0;
        this._spawnTime = performance.now();
    }

    wait(percentElapsedTime: number): PlayerAction {
        if (this.checkBail(percentElapsedTime)) {
            this.action = PlayerAction.Bail
        } else {
            this.action = PlayerAction.Wait;
        }
        return this.action;
    }

    start(): void {
        this._startTime = performance.now();
    }

    play(percentElapsedTime: number): PlayerAction {
        this.ticks++;
        if (this.checkQuit(percentElapsedTime)) {
            this.action =  PlayerAction.Quit
        } else {
            this.action =  PlayerAction.Play;
        }
        return this.action;
    }

    checkBail(percentElapsedTime: number): boolean {
        // console.log(`Player ${this.account.name} checkBail ${percentElapsedTime}`);
        let random: number = Math.random();
        let scaledBailProbability: number = this.bailProbability * percentElapsedTime;
        if (random <= scaledBailProbability) {
            console.log(`Player ${this.account.name} bailing: ${random} < ${scaledBailProbability}: ${this.bailProbability}, ${percentElapsedTime}`);
            return true;
        } else {
            return false
        }
    }

    checkQuit(percentElapsedTime: number): boolean {
        // console.log(`Player ${this.account.name} checkQuit ${percentElapsedTime}`);
        let random: number = Math.random();
        let scaledQuitProbability: number = this.quitProbability * percentElapsedTime;
        if (random <= scaledQuitProbability) {
            console.log(`Player ${this.account.name} quitting: ${this.ticks} ${random} < ${scaledQuitProbability}: ${this.quitProbability}, ${percentElapsedTime}`);
            return true;
        } else {
            return false
        }
    }

    get waitTime(): number {
        return performance.now() - this._spawnTime;
    }

    get playTime(): number {
        return performance.now() - this._startTime;
    }

    get json(): any {
        let json: any = {};
        json.uuid = this.account.uuid;
        json.playTime = this.playTime;
        json.action = PlayerAction[this.action]
        return json;
    }
}
