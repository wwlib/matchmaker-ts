import * as PubSubJS from 'pubsub-js';
import Message from '../message/Message';
import MessageFactory from '../message/MessageFactory';
import WebSocket = require('ws');
import PlayerAccount from '../PlayerAccount';
import Msg_Chat from '../message/Msg_Chat';
import Msg_Text from '../message/Msg_Text';
import Msg_JoinGame from '../message/Msg_JoinGame';
import Msg_Auth from '../message/Msg_Auth';
import TCPClientServer from './TCPClientServer';

export type MockWebSocket = {
	host: string;
	port: number;
	on: any,
	send: any
}

export default class TCPClientSession {

	public clientServer: TCPClientServer
	public lastMessageReceivedTime: number;

	private _userUUID: string;
	private _socket: any; //FIXME: WebSocket;
	private _ip: string;
	private _port: number;
	private _spawnTime: number;
	private _userToken: any;

	constructor(clientServer: TCPClientServer, socket: WebSocket | MockWebSocket) {
		this.clientServer = clientServer;
		this._socket = socket;
		this._ip = this._socket.host;
		this._port = this._socket.port;
		console.log(`ip: ${this._ip}, port: ${this._port}`);
		this.start();
	}

	get userUUID(): string {
		return this._userUUID;
	}

	set userUUID(uuid: string) {
		this._userUUID = uuid;
		this._userToken = PubSubJS.subscribe(this._userUUID, this.userSubscriber.bind(this));
	}

	userSubscriber(msg: any, data: any): void {
		console.log(`TCPClientSession: userSubscriber: ${this.userUUID}: `, data);
		this.sendText(`${data}`);
	}

	publish(data: any, subtopic?: string): void {
		let topic: string = this.userUUID;
		if (subtopic) {
			topic = `${topic}.${subtopic}`;
		}
		PubSubJS.publish(topic, data);
	}

	start(): void {
		console.log(`TCPClientSession: start`);
		this._spawnTime = performance.now();
		this._socket.on('close', () => {
			console.log('TCPClientSession: on close');
			this.dispose();
		});

		this._socket.on('message', (message: any, flags: any) => {
			console.log('TCPClientSession: on message: ', message, flags);
			this.onMessage(message, this._socket);
		});
	}

/* from Message
export enum MessageType {
    Auth,
    Text,
	JoinGame,
    Admin,
    Chat,
}
*/

	onMessage(message: any, socket: WebSocket | MockWebSocket): void {
		this.lastMessageReceivedTime = performance.now();
		let rinfo: any = {address: this._ip, port: this._port};
		let msg: Message = MessageFactory.parse(message, rinfo, this);
		let message_type: number = msg.getType();
		console.log(msg);

		switch (message_type) {
			case 0: //AUTH:
				let tempAuthMsg: Msg_Auth = msg as Msg_Auth;
				tempAuthMsg.host = this._ip;
				tempAuthMsg.port = this._port;
				this.publish(tempAuthMsg, 'auth');
				break;
			case 1: //TEXT:
				break;
			case 2: //JOIN_GAME
				let tempJoinGameMsg: Msg_JoinGame = msg as Msg_JoinGame;
				tempJoinGameMsg.host = this._ip;
				tempJoinGameMsg.port = this._port;
				this.publish(tempJoinGameMsg, 'join');
				break;
			case 3: //ADMIN:
				break;
			case 4: //CHAT
				let tempChatMsg: Msg_Chat = msg as Msg_Chat;
				tempChatMsg.host = this._ip;
				tempChatMsg.port = this._port;
				this.publish(tempChatMsg, 'chat');
				break;
			default:
				console.log("Unidentified packet type.");
				break;
		}
	}

	get port(): string {
		return this._ip;
	}

	get ip(): number {
		return this._port;
	}

	get idleTime(): number {
		return performance.now() - this.lastMessageReceivedTime;
	}

	get aliveTime(): number {
		return performance.now() - this._spawnTime;
	}

	public sendText(message: string): void {
		this._socket.send(message);
	}

	dispose(): void {
		this.clientServer = undefined;
		this._socket.removeAllListeners();
		try {
			this._socket.close();
		} catch (err) {
			console.log(err);
		}
		this._socket = undefined;
		PubSub.unsubscribe(this._userToken);
		this._userToken = undefined;
	}
}
