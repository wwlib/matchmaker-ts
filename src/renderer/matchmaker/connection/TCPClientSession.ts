import * as PubSubJS from 'pubsub-js';
import Message, { MessageType } from '../message/Message';
import MessageFactory from '../message/MessageFactory';
import WebSocket = require('ws');
import Msg_Chat from '../message/Msg_Chat';
import Msg_Auth from '../message/Msg_Auth';
import TCPClientServer from './TCPClientServer';
import Director from '../Director';

const now = require("performance-now");

export type MockWebSocket = {
	host: string;
	port: number;
	on: any,
	send: any,
	removeAllListeners: any,
	close: any
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
		// console.log(`ip: ${this._ip}, port: ${this._port}`);
		this.start();
	}

	get userUUID(): string {
		return this._userUUID;
	}

	set userUUID(uuid: string) {
		this._userUUID = uuid;
		Director.Instance().addAuthenticatedClientSession(this._userUUID, this);
		this._userToken = PubSubJS.subscribe(`${this._userUUID}.out`, this.userSubscriberOut.bind(this));
	}

	userSubscriberOut(msg: any, data: any): void {
		// console.log(`TCP_c: userSubscriberOut: ${this.userUUID}: received -->`, data);
		this.sendBytes(data);
	}

	publish(data: any, subtopic: string = 'in'): void {
		if (this._userUUID) {
			let topic: string = this.userUUID;
			if (subtopic) {
				topic = `${topic}.${subtopic}`;
			}
			PubSubJS.publish(topic, data);
		} else {
			console.log(`TCP_c: publish: error: userUUID undefined.`)
		}
	}

	start(): void {
		// console.log(`TCP_c: start`);
		this._spawnTime = now();
		this._socket.on('close', () => {
			console.log('TCP_c: on(close)');
			this.dispose();
		});

		this._socket.on('message', (message: any, flags: any) => {
			// console.log('TCP_c: on(message): ', message, flags);
			this.onMessage(message);
		});
	}

	/* From Message
	export enum MessageType {
	    Auth,
	    Chat,
	}
	*/

	onMessage(message: any): void {
		// console.log(`TCP_c: onMessage: `, message);
		this.lastMessageReceivedTime = now();
		let rinfo: any = {address: this._ip, port: this._port};
		let msg: Message = MessageFactory.parse(message, rinfo);
		if (msg) {
			let message_type: number = msg.getType();

			switch (message_type) {
				case MessageType.Auth:
					let authMsg: Msg_Auth = msg as Msg_Auth;
					authMsg.host = this._ip;
					authMsg.port = this._port;
					console.log(`  --> TCP_c: received Msg_Auth: `, authMsg);
					this.userUUID = Director.Instance().authenticateUser(authMsg); //TODO: add real authentication flow
					authMsg.userUUID = this.userUUID;
					authMsg.password = '';
					authMsg.authToken = '<AUTH-TOKEN>';
					authMsg.command = 'authorized';
					this.sendMessage(authMsg); // ACK
					break;
				case MessageType.Chat:
					console.log(`  --> TCP_c: received Msg_Chat: `, message);
					this.publish(message);
					break;
				default:
					console.log("  --> TCP_c: unrecognized message type.");
					break;
			}
		} else {
			console.log(`  --> TCP_c: unrecognized message format: `, message);
		}
	}

	get port(): string {
		return this._ip;
	}

	get ip(): number {
		return this._port;
	}

	get idleTime(): number {
		return now() - this.lastMessageReceivedTime;
	}

	get aliveTime(): number {
		return now() - this._spawnTime;
	}

	public sendText(message: string): void {
		this._socket.send(message);
	}

	public sendMessage(message: Message): void {
		this._socket.send(message.getBytes());
	}

	public sendBytes(bytes: any): void {
		this._socket.send(bytes);
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
		PubSubJS.unsubscribe(this._userToken);
		this._userToken = undefined;
	}
}
