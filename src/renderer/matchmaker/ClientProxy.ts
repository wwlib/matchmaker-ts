import * as PubSubJS from 'pubsub-js';
import GameWorld from './game/GameWorld';
import Lobby from './game/Lobby';
import PlayerAccount from './PlayerAccount';
import Database from './Database';

const now = require("performance-now");

export default class ClientProxy {

    public playerAccount: PlayerAccount;

    private _userUUID: string;
    private _gameWorld: GameWorld;
    private _userToken: any;
    private _spawnTime: number;
    private _startGameTime: number;
    private _startGameTimeOffset: number;


    constructor(userUUID: string) {
        this._userUUID = userUUID;
        this.playerAccount = Database.getPlayerWithUUID(this._userUUID);
        this._userToken = PubSubJS.subscribe(`${this._userUUID}.in`, this.userSubscriberIn.bind(this));
        this._spawnTime = now();
        this._startGameTime = now();
        this._startGameTimeOffset = 0;
    }

    get userUUID(): string {
        return this._userUUID;
    }

    publish(data: any, subtopic: string = 'out'): void {
		let topic: string = this._userUUID;
		if (subtopic) {
			topic = `${topic}.${subtopic}`;
		}
        console.log(`ClientProxy publishing to: ${topic}`, data);
		PubSubJS.publish(topic, data);
	}

    userSubscriberIn(msg: any, data: any): void {
        console.log(`ClientProxy: ${this._userUUID}: `, data);
        this.sendMessageToGameWorld(data);
    }

    restartGameTime(): void {
        this._startGameTime = now();
    }

    get aliveTime(): number {
        return now() - this._spawnTime;
    }

    get gameTime(): number {
        return now() - this._startGameTime + this._startGameTimeOffset;
    }

    set startGameTimeOffset(time: number) {
        this._startGameTimeOffset = time;
    }

    sendMessageToGameWorld(data: any): void {
        this._gameWorld.receiveMessageFromClient(data, this);
    }

    get shortId(): string {
        let shortId: string = 'NA';
        if (this._userUUID) {
            shortId = this._userUUID.substring(0,8);
        }
        return shortId;
    }

    dispose(): void {
        this._gameWorld = undefined;
        PubSubJS.unsubscribe(this._userToken);
    }
}
