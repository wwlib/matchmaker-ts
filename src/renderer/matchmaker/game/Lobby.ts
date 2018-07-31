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
    public maxCombinedClientWaitTime: number = 30000;
    public maxClientMMRDifference: number = 100;

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

        this.start();
    }

    tick(): number {
        let iterator1: IterableIterator<[string, ClientProxy]> = this._clients.entries();
        let iterator2: IterableIterator<[string, ClientProxy]> = this._clients.entries();
        let client1: ClientProxy;
        let client2: ClientProxy;
        let matchCount: number = 0;

        let element1: any;
        let element2: any;
        while( element1 = iterator1.next().value ) {
            client1 = element1[1];
            while (element2 = iterator2.next().value ) {
                client2 = element2[1];
                if ((client1 != client2) && this.willMatchClients(client1, client2)) {
                    matchCount++;
                    // this.log(`MATCH: ${client1.shortId} ${client1.playerAccount.mmr} ${client1.gameTime} <-> ${client2.shortId} ${client2.playerAccount.mmr} ${client2.gameTime}`)
                    this.removeClient(client1);
                    this.removeClient(client2);
                    Director.Instance().handleGameOver(client1, client2);
                    break;
                }
            }
        }
        return matchCount;
    }

    receiveMessageFromClient(data: any, client: ClientProxy): void {
        // this.log(`receiveMessageFromClient: ${client.shortId}`, data);
        this.broadcast(data);
    }

    willAcceptPlayer(player: PlayerAccount): boolean {
        let result: boolean = true;
        if (player.location != this.location) { result = false };
        if (!Lobby.inRange(player.mmr, this.mmrRange)) { result = false };
        if (this._clients.size >= this.maxClients) { result = false }
        return result;
    }

    willMatchClients(client1: ClientProxy, client2: ClientProxy): boolean {
        let result: boolean = false;
        let combinedWaitTime: number = client1.gameTime + client2.gameTime;
        if (Math.abs(client1.playerAccount.mmr - client2.playerAccount.mmr) <= this.maxClientMMRDifference) {result = true};
        if (combinedWaitTime >= this.maxCombinedClientWaitTime) {result = true};
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
