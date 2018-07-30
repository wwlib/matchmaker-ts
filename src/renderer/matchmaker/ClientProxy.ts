import * as PubSubJS from 'pubsub-js';
import GameWorld from './game/GameWorld';
import Lobby from './game/Lobby';

export default class ClientProxy {

    private _userUUID: string;
    private _gameWorld: GameWorld;
    private _userToken: any;

    constructor(userUUID: string) {
        this._userUUID = userUUID;
        this._userToken = PubSubJS.subscribe(`${this._userUUID}.in`, this.userSubscriberIn.bind(this));
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

    // get gameWorld() {
    //     return this._gameWorld as Lobby;
    // }
    //
    // set gameWorld(lobby: Lobby) {
    //     this._gameWorld = lobby;
    // }

    // removeFromLobby(): void {
    //     this._gameWorld = undefined;
    // }
    //
    // addToGame(game: GameWorld) {
    //     this._gameWorld = game;
    // }
    //
    // removeFromGame(): void {
    //     this._gameWorld = undefined;
    // }

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
}
