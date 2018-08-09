import PubSub, { PubSubClient } from '../PubSub';
import WebSocket = require('ws');
import {
	Message,
	MessageFactory,
	Msg_Chat,
	Msg_Auth,
	Msg_JSON
 } from '../message';
// import TCPClientServer from './TCPClientServer';
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

	// public clientServer: TCPClientServer
	public lastMessageReceivedTime: number;

	protected _userUUID: string;
	protected _socket: any; //FIXME: WebSocket;
	protected _ip: string;
	protected _port: number;
	protected _spawnTime: number;
	// protected _userToken: any;
	protected _pubClient: PubSubClient;
	protected _subClient: PubSubClient;

	constructor(socket: WebSocket | MockWebSocket) { //clientServer: TCPClientServer,
		// this.clientServer = clientServer;
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
		// this._userToken = PubSub.Instance().subscribe(`${this._userUUID}.out`, this.userSubscriberOut.bind(this));
		this._pubClient = PubSub.Instance().createClient();
		this._subClient = PubSub.Instance().createClient();
		this._subClient.on('message_buffer', this.userSubscriberOut.bind(this));
		this._subClient.subscribe(`${this._userUUID}.out`);
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
			// PubSub.Instance().publish(topic, data);
			this._pubClient.publish(topic, data);
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
				case Msg_Auth.type:
					let authMsg: Msg_Auth = msg as Msg_Auth;
					authMsg.host = this._ip;
					authMsg.port = this._port;
					console.log(`  --> TCP_c: received Msg_Auth: `, authMsg.command);
					this.userUUID = Director.Instance().authenticateUser(authMsg); //TODO: add real authentication flow
					this.sendServerDetails();
					authMsg.userUUID = this.userUUID;
					authMsg.password = '';
					authMsg.authToken = '<AUTH-TOKEN>';
					authMsg.command = 'authorized';
					this.sendMessage(authMsg); // ACK
					break;
				case Msg_Chat.type:
					console.log(`  --> TCP_c: received Msg_Chat: `);
					this.publish(message);
					break;
				case Msg_JSON.type:
					let jsonMsg: Msg_JSON = msg as Msg_JSON;
					console.log(`  --> TCP_c: received Msg_JSON: `);
					// this.publish(message);
					console.log(jsonMsg.name, jsonMsg.json);
					break;
				default:
					console.log("  --> TCP_c: unrecognized message type.");
					break;
			}
		} else {
			console.log(`  --> TCP_c: unrecognized message format: `, message);
		}
	}

	sendServerDetails(): void {
		 Director.Instance().sendServerDetailsToClientWithUUID(this.userUUID);
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
		// this.clientServer = undefined;
		try {
			if (this._socket) {
				this._socket.removeAllListeners();
				this._socket.close();
			}
		} catch (err) {
			console.log(err);
		}
		this._socket = undefined;
		// PubSub.Instance().unsubscribe(this._userToken);
		this._subClient.unsubscribe();
        this._subClient.quit();
		this._pubClient.quit();
		// this._userToken = undefined;
		this._pubClient = undefined;
		this._subClient = undefined;
	}
}
