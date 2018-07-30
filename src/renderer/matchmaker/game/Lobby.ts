import * as PubSubJS from 'pubsub-js';
import Director, { DirectorTopic } from '../Director';
import GameWorld, { GameWorldType, GameWorldState } from './GameWorld';
import ClientProxy from '../ClientProxy';
import PlayerAccount, { PlayerLocation } from '../PlayerAccount';
import Database from '../Database';


export type Range = {
    min: number;
    max: number;
}

export type LobbyOptions = {
    memberRange: Range;
    location: PlayerLocation;
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
    public location: PlayerLocation;
    public mmrRange: Range;
    public latencyRange: Range;
    public priorityRange: Range;

    constructor(options?: any) {
        super();
        options = options || {};
        let defaultOptions: LobbyOptions =  {
            memberRange: {min: 10, max: 20},
            location: PlayerLocation.NorthAmericaEast,
            mmrRange: {min: 400, max: 600},
            latencyRange: {min: 10, max: 100},
            priorityRange: {min: 0, max: 3},
            type: GameWorldType.Lobby,
            minClients: 0,
            maxClients: 20,
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

        // PubSubJS.publish(DirectorTopic.Lobby, `${this.uuid}: ready`);
        // this.publish('ready');
    }

    tick(): void {
        this.log(`tick`);
    }

    receiveMessageFromClient(data: any, client: ClientProxy): void {
        this.log(`receiveMessageFromClient: ${client.shortId}`, data);
        this.broadcast(data);
    }

    willAcceptPlayer(player: PlayerAccount): boolean {
        let result: boolean = true;
        if (player.location != this.location) { result = false };
        if (!Lobby.inRange(player.mmr, this.mmrRange)) { result = false };
        if (this._clients.size >= this.maxClients) { result = false }
        return result;
    }

    logClients(): void {
        this._clients.forEach((client: ClientProxy, key: string) => {
            let player: PlayerAccount = Database.getPlayerWithUUID(client.userUUID);
            console.log(`  GameWorld: Client: ${client.shortId} player.mmr: ${player.mmr}`)
        });
    }

    dispose(): void {
        super.dispose();
    }

    /**
     * checks to see if a value is in the specified Range
     * @param  value numeric value
     * @param  range {min: number, max: number}
     * @return       true if value is in the Range
     */
    static inRange(value: number, range: Range): boolean {
        return value >= range.min && value <= range.max
    }

    /* default MMR ranges */
    static MMRRanges: Range[] = [
        {min: 0, max: 300},
        {min: 301, max: 600},
        {min: 601, max: 1000},
        {min: 1001, max: 1800},
        {min: 1801, max: 2000},
        {min: 2001, max: 10000},
    ]

    /**
     * determines the MMR range for a given player's MMR expectedScoreA
     * @param  player
     * @return        returns a range: {min: number, max: number}
     */
    static getMMRRangeWithPlayerAccount(player: PlayerAccount): Range {
        let range: Range = {min: 1001, max: 1800};
        Lobby.MMRRanges.forEach((testRange: Range) => {
            if (Lobby.inRange(player.mmr, testRange)) {
                range = testRange;
            }
        })
        return range;
    }
}
