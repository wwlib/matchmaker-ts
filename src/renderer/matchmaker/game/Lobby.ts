import * as PubSubJS from 'pubsub-js';
import Director, { DirectorTopic } from '../Director';
import GameWorld, { GameWorldType, GameWorldState } from './GameWorld';
import ClientProxy from '../ClientProxy';

export enum Location {
    NorthAmericaEast,
    NortAmericaWest,
    Europe,
    Asia
}

export type Range = {
    min: number;
    max: number;
}

export type LobbyOptions = {
    memberRange: Range;
    location: Location;
    mmrRange: Range;
    latencyRange: Range;
    priorityRange: Range;
    uuid?: string;
    type?: GameWorldType
    minClients?: number;
    maxClients?: number;
    deltaTime?: number;
    debug?: boolean;
}

export default class Lobby extends GameWorld {

    //public activeAccounts: Map<string, LobbyAccount> = new Map<string, LobbyAccount>();
    public memberRange: Range;
    public location: Location;
    public mmrRange: Range;
    public latencyRange: Range;
    public priorityRange: Range;

    constructor(options?: any) {
        super();
        options = options || {};
        let defaultOptions: LobbyOptions =  {
            memberRange: {min: 10, max: 20},
            location: Location.NorthAmericaEast,
            mmrRange: {min: 400, max: 600},
            latencyRange: {min: 10, max: 100},
            priorityRange: {min: 0, max: 3},
            type: GameWorldType.Lobby,
            minClients: 0,
            maxClients: 10,
            deltaTime: 1000,
            debug: true
        }
        options = Object.assign(defaultOptions, options);

        this.memberRange = options.memberRange;
        this.location = options.location;
        this.mmrRange = options.mmrRange;
        this.latencyRange = options.latencyRange;
        this.priorityRange = options.priorityRange;

        this._type = options.type;
		this.minClients = options.minClients;
		this.maxClients = options.maxClients;
		this._deltaTime = options.deltaTime;
		this.debug = options.debug;

        this._state = GameWorldState.Ready;

        PubSubJS.publish(DirectorTopic.Lobby, `${this.uuid}: ready`);
        this.publish('ready');
    }

    tick(): void {
        this.log(`tick`);
    }

    receiveMessageFromClient(data: any, client: ClientProxy): void {
        this.log(`receiveMessageFromClient: ${client.shortId}`, data);
        this.broadcast(data);
    }

    // addLobbyAccount(lobbyAccount: LobbyAccount): void {
    //     this.activeAccounts.set(lobbyAccount.playerAccount.uuid, lobbyAccount);
    // }
    //
    // removeLobbyAccount(lobbyAccount: LobbyAccount): void {
    //     lobbyAccount.lobby = null;
    //     this.activeAccounts.delete(lobbyAccount.playerAccount.uuid);
    // }

    // getMatchedPlayers(count: number = 2): LobbyAccount[] {
    //     let result: LobbyAccount[] = [];
    //     this.activeAccounts.forEach((lobbyAccount: LobbyAccount, uuid: string) => {
    //         if (result.length < count) {
    //             result.push(lobbyAccount);
    //             this.removeLobbyAccount(lobbyAccount);
    //         }
    //     });
    //     return result;
    // }
}
