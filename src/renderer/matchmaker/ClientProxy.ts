import PubSub from './PubSub';
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
        this._userToken = PubSub.Instance().subscribe(`${this._userUUID}.in`, this.userSubscriberIn.bind(this));
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
        console.log(`ClientProxy publishing to: ${topic}`);
		PubSub.Instance().publish(topic, data);
	}

    userSubscriberIn(msg: any, data: any): void {
        console.log(`ClientProxy: userSubscriberIn: ${this._userUUID}: `);
        this.sendMessageToGameWorld(data);
    }

    restartGameTime(): void {
        this._startGameTime = now();
    }

    set gameWorld(gameWorld: GameWorld) {
        this._gameWorld = gameWorld;
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
        this.playerAccount = undefined;
        this._gameWorld = undefined;
        PubSub.Instance().unsubscribe(this._userToken);
    }
}
