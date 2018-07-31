import * as PubSubJS from 'pubsub-js';
import ConnectionManager from './connection/ConnectionManager';
import TCPClientSession, { MockWebSocket } from './connection/TCPClientSession';
import Lobby, { Range } from './game/Lobby';
import ClientProxy from './ClientProxy';
import Msg_Auth from './message/Msg_Auth';
import PlayerAccount from './PlayerAccount';
import Database from './Database';

// const accountData: any = require('../../../data/accounts');

const uuidv4 = require('uuid/v4');
const EloRank = require('elo-rank');
const elo = new EloRank(32);

export enum DirectorMode {
    Primary,
    Replica
}

export enum DirectorTopic {
    Lobby = 'Lobby',
    Game = 'Game'
}

export type DirectorOptions = {
    uuid?: string;
    mode?: DirectorMode;
    debug?: boolean;
}

export default class Director {

    private static _instance: Director;

    public uuid: string;
    public mode: DirectorMode;
    public maxLobbies: number;
    public debug: boolean;

    private _connectionManager: ConnectionManager;
    // private _lobbyToken: any;
    private _lobbies: Map<string, Lobby> = new Map<string, Lobby>();
    private _authenticatedClientSessions: Map<string, TCPClientSession> = new Map<string, TCPClientSession>();

    constructor( options?: DirectorOptions) {
        options = options || {};
        let defaultOptions: DirectorOptions =  {
            uuid: uuidv4(),
			mode: DirectorMode.Primary,
            debug: false
        }
		options = Object.assign(defaultOptions, options);
		this.uuid = options.uuid;
		this.mode = options.mode;
        this.debug = options.debug;

        if (this.mode == DirectorMode.Primary) {
            this.createGlobalChanels();
        }

        Database.init();
    }

    static Instance(options?: DirectorOptions)
    {
        return this._instance || (this._instance = new this(options));
    }

    createGlobalChanels(): void {
        // this._lobbyToken = PubSubJS.subscribe(DirectorTopic.Lobby, this.lobbySubscriber.bind(this));
    }

    startConnectionManager(): void {
        this._connectionManager = new ConnectionManager({debug: this.debug});
    }

    // lobbySubscriber(msg: string, data: any): void {
    //     this.log(`lobbySubscriber : msg: ${msg}`, data);
    // }

    // addLobby(): Lobby {
    //     let lobby: Lobby = new Lobby();
    //     this._lobbies.set(lobby.uuid, lobby);
    //     return lobby;
    // }

    get lobyCount(): number {
        return this._lobbies.size;
    }

    addLobbyWithPlayerAccount(player: PlayerAccount): Lobby {
        let mmrRange: Range = Lobby.getMMRRangeWithPlayerAccount(player);
        let lobby: Lobby = new Lobby({mmrRange: mmrRange, location: player.location});
        this._lobbies.set(lobby.uuid, lobby);
        return lobby;
    }

    addClientToLobby(clientProxy: ClientProxy): Lobby {
        let player: PlayerAccount = Database.getPlayerWithUUID(clientProxy.userUUID);
        let lobby: Lobby;
        if (player) {
            this._lobbies.forEach((testLobby: Lobby, key: string) => {
                if (testLobby.willAcceptPlayer(player)) {
                    lobby = testLobby;
                } else {
                    // console.log(`Director: addClientToLobby: testLobby rejected PlayerAccount:`, testLobby, player);
                }
            });
            if (!lobby) {
                lobby = this.addLobbyWithPlayerAccount(player);
                // console.log(`Director: addClientToLobby: new lobby for PlayerAccount:`, lobby, player);
            }
            lobby.addClient(clientProxy);
        } else {
            throw new Error('Invalid PlayerAccount.');
        }
        return lobby;
    }

    addMockClient(): ClientProxy {
        let mockWebSocket: MockWebSocket = {
            host: '0',
            port: 0,
            on: () => {},
            send:  (msg: any) => {},
            removeAllListeners: () => {},
            close: () => {},
        }
        let clientSession: TCPClientSession = this._connectionManager.TCP_s.onConnection(mockWebSocket);
        let playerAccount: PlayerAccount = Database.generateMockPlayerAccount();
        clientSession.userUUID = playerAccount.uuid;
        let client: ClientProxy = new ClientProxy(playerAccount.uuid);
        this.addClientToLobby(client);
        // console.log(`Director: addedMockClient: `, client, playerAccount);
        this.logLobbyStats();
        return client;
    }

    logLobbyStats(): void {
        this._lobbies.forEach((lobby: Lobby, key: string) => {
            console.log(`Director: Lobby count: ${this._lobbies.size} mmrRange: `, lobby.mmrRange);
            lobby.logClients();
        });
    }

    authenticateUser(authMsg: Msg_Auth): string {
        //TODO: implement authentication
        console.log(`Director: authenticateUser: `, authMsg);
        let playerAccount: PlayerAccount = Database.generateMockPlayerAccount();
        let client: ClientProxy = new ClientProxy(playerAccount.uuid);
        this.addClientToLobby(client);
        return playerAccount.uuid;
    }

    updateMMR(winner: PlayerAccount, loser: PlayerAccount): void {
        //Gets expected score for first parameter
        var expectedScoreA = elo.getExpected(winner.mmr, loser.mmr);
        var expectedScoreB = elo.getExpected(loser.mmr, winner.mmr);

        //update score, 1 if won 0 if lost
        winner.mmr = elo.updateRating(expectedScoreA, 1, winner);
        loser.mmr = elo.updateRating(expectedScoreB, 0, loser);
    }

    removeLobby(lobby: Lobby): void {
        this._lobbies.delete(lobby.uuid);
        lobby.dispose();
    }

    removeAllLobbies(): void {
        this._lobbies.forEach((lobby: Lobby, key: string) => {
            this.removeLobby(lobby);
        });
    }

    addAuthenticatedClientSession(userUUID: string, clientSession: TCPClientSession): void {
        this._authenticatedClientSessions.set(userUUID, clientSession);
    }

    removeAuthenticatedClientSession(userUUID: string): void {
        let clientSession: TCPClientSession = this._authenticatedClientSessions.get(userUUID);
        if (this._connectionManager && this._connectionManager.TCP_s) {
            this._connectionManager.TCP_s.removeClientSession(clientSession); // _connectionManager is undefined when running tests
        }
        this._authenticatedClientSessions.delete(userUUID);
    }

    handleGameOver(client1: ClientProxy, client2: ClientProxy): void {
        // for now, dispose clients and remove associated player activeAccounts
        this.log(`handleGameOver: ${client1.shortId} ${client1.playerAccount.mmr} ${client1.gameTime} <-> ${client2.shortId} ${client2.playerAccount.mmr} ${client2.gameTime}`)

        this.removeAuthenticatedClientSession(client1.userUUID);
        this.removeAuthenticatedClientSession(client2.userUUID);
        client1.dispose();
        client2.dispose();
    }

    log(msg: string, obj?: any): void {
        console.log(`DIRECTOR: ${msg}: `, obj);
    }
}
