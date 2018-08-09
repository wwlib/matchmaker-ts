// import PubSub from '../PubSub';
import Director, { DirectorTopic } from '../Director';
import TCPClientSession from '../connection/TCPClientSession';
import PlayerAccount from '../PlayerAccount';
import ClientProxy from '../ClientProxy';

const uuidv4 = require('uuid/v4');
const now = require("performance-now");

export enum GameWorldState {
	Ready,
	InProgress,
	Over
}

export enum GameWorldType {
	Lobby,
	Game
}

export type GameWorldOptions = {
	uuid?: string;
	type?: GameWorldType
	minClients?: number;
	maxClients?: number;
	deltaTime?: number;
	debug?: boolean;
}

export default abstract class GameWorld {

	protected _clients: Map<string, ClientProxy> = new Map<string, ClientProxy>();

	public uuid: string;
	public minClients: number;
	public maxClients: number;
	public debug: boolean;

	protected _type: GameWorldType;
	protected _deltaTime: number;
	protected _state: GameWorldState;

	private _channelToken: any;
	private _tickInterval: any;
	private _tickHandler: any = this.tick.bind(this);

	public tickStartTime: number;
	public avgTickTime: number;
	public lastTickTime: number;

	abstract tick(): void;

	constructor( options?: GameWorldOptions) {
        options = options || {};
        let defaultOptions: GameWorldOptions =  {
			uuid: uuidv4(),
			type: GameWorldType.Game,
            minClients: 2,
            maxClients: 2,
            deltaTime: 1000,
			debug: true
        }
		options = Object.assign(defaultOptions, options);

		this.uuid = options.uuid;
		this._type = options.type;
		this.minClients = options.minClients;
		this.maxClients = options.maxClients;
		this._deltaTime = options.deltaTime;
		this.debug = options.debug;
		this.avgTickTime = 0;
		this._state = GameWorldState.Ready;

		// this._channelToken = PubSub.Instance().subscribe(this.uuid, this.channelSubscriber.bind(this));
	}

	// publish(data: any, subtopic?: string): void {
	// 	let topic: string = this.uuid;
	// 	if (subtopic) {
	// 		topic = `${topic}.${subtopic}`;
	// 	}
	// 	PubSub.Instance().publish(topic, data);
	// }

	// channelSubscriber(msg: any, data: any): void {
	// 	this.log(`channelSubscriber: ${msg}: `, data);
	// }

	// publishViaClientProxy(data: any, client: ClientProxy, subtopic?: string): void {
	// 	client.publish(data, subtopic);
	// }

	getInvitationToken(): string {
		//TODO: ecode gw uuid, host, ip
		return '<INVITATION-TOKEN>';
	}

	willAcceptPlayer(player: PlayerAccount, invitationToken?: string): boolean {
		let result: boolean = false;
		//TODO
		return result;
	}

	broadcast(data: any, sourceClient?: ClientProxy, subtopic?: string): void {
		// this.log(`broadcasting...`);
		this._clients.forEach((client: ClientProxy, key: string) => {
			if (client != sourceClient) {
				// this.log(`broadcasting to: ${client.shortId}`, data);
				client.publish(data, subtopic);
			}
		});
	}

	receiveMessageFromClient(data: any, client: ClientProxy): void {
		// this.log(`receiveMessageFromClient: ${client.shortId}`, data);
	}

	start(): void {
		this._tickInterval = setInterval(this._tickHandler, this._deltaTime);
		this._state = GameWorldState.InProgress;
	}

	stop(): void {
		clearInterval(this._tickInterval);
	}

	over(): void {
		this.stop();
		this._state = GameWorldState.Over;
	}

	addClient(client: ClientProxy): void {
		this._clients.set(client.userUUID, client);
		client.restartGameTime();
	}

	removeClient(client: ClientProxy): void {
		this._clients.delete(client.userUUID);
	}

	removeAllClients(): void {
		this._clients.forEach((client: ClientProxy, key: string) => {
			this.removeClient(client);
		});
	}

	set deltaTime(deltaTime: number) {
		this._deltaTime = deltaTime;
	}

	get type(): GameWorldType {
		return this._type;
	}

	get shortId(): string {
		return this.uuid.substring(0,8);
	}

	get clientCount(): number {
		return this._clients.size;
	}

	logClients(): void {
		this._clients.forEach((client: ClientProxy, key: string) => {
			console.log(`  GameWorld: Client: ${client.shortId} `)
		});
	}

	startTick(): void {
		this.tickStartTime = now();
	}

	endTick(): void {
		this.lastTickTime = now() - this.tickStartTime;
		this.updateAverageTickTime(this.lastTickTime)
	}

	updateAverageTickTime(tickTime): void {
		this.avgTickTime += (tickTime - this.avgTickTime) * 0.1;
	}

	dispose(): void {
		// PubSub.Instance().unsubscribe(this._channelToken);
		clearInterval(this._tickInterval);
		this._tickHandler = undefined;
		this.removeAllClients();
	}

	log(msg: string, obj?: any): void {
		if (this.debug) {
        	console.log(`${GameWorldType[this._type]}: ${GameWorldState[this._state]}: ${this.shortId}: ${msg}: `, obj);
		}
	}
}
