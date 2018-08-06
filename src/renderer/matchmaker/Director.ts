import PubSub from './PubSub';
import ConnectionManager from './connection/ConnectionManager';
import TCPClientSession, { MockWebSocket } from './connection/TCPClientSession';
import Lobby, { Range } from './game/Lobby';
import GameWorld, { GameWorldType } from './game/GameWorld';
import MockGame from './game/MockGame';
import ChatLobby from './game/ChatLobby';
import ClientProxy from './ClientProxy';
import Msg_Auth from './message/Msg_Auth';
import PlayerAccount from './PlayerAccount';
import Database from './Database';

const uuidv4 = require('uuid/v4');
const EloRank = require('elo-rank');
const elo = new EloRank(32);
const now = require("performance-now");

export enum DirectorMode {
    Primary = 'Primary',
    Replica = 'Replica'
}

export enum DirectorTopic {
    Lobby = 'Lobby',
    Game = 'Game'
}

export type DirectorOptions = {
    uuid?: string;
    mode?: DirectorMode;
    connectionPort?: number;
    deltaTime?: number;
    debug?: boolean;
}

export default class Director {

    private static _instance: Director;

    public uuid: string;
    public mode: DirectorMode;
    public maxLobbies: number;
    public debug: boolean;
    public performanceStats: any;
    public lobbyStats: any[];

    private _connectionManager: ConnectionManager;
    private _connectionPort: number;
    private _lobbies: Map<string, GameWorld> = new Map<string, GameWorld>();
    private _authenticatedClientSessions: Map<string, TCPClientSession> = new Map<string, TCPClientSession>();
    private _recycleClientQueue: ClientProxy[];
    private _disposeClientQueue: ClientProxy[];
    private _disposedClientCount: number;
    private _disposeGameQueue: GameWorld[];
    private _disposedGameCount: number;

    private _tickInterval: any;
    private _tickHandler: any = this.tick.bind(this);
    private _deltaTime: number;
    public avgTickTime: number;
    public lastTickTime: number;

    constructor( options?: DirectorOptions) {
        options = options || {};
        let defaultOptions: DirectorOptions =  {
            uuid: uuidv4(),
			mode: DirectorMode.Primary,
            connectionPort: 9696,
            deltaTime: 1000,
            debug: false
        }
		options = Object.assign(defaultOptions, options);
        console.log(`Director: constructor: options: `, options);
		this.uuid = options.uuid;
		this.mode = options.mode;
        this._connectionPort = options.connectionPort;
        this._deltaTime = options.deltaTime;
        this.debug = options.debug;

        if (this.mode == DirectorMode.Primary) {
        }

        this.performanceStats = undefined;
        this.lobbyStats = [];
        this.avgTickTime = 0;
        this._recycleClientQueue = [];
        this._disposeClientQueue = [];
        this._disposedClientCount = 0;
        this._disposeGameQueue = [];
        this._disposedGameCount = 0;
        Database.init();
    }

    static Instance(options?: DirectorOptions)
    {
        return this._instance || (this._instance = new this(options));
    }

    tick(): void {
        let startTime: number = now();
        this.lobbyStats = [];
        this._lobbies.forEach((lobby: Lobby, key: string) => {
            if ( !(lobby instanceof ChatLobby) ) {
                lobby.tick();
                if (lobby instanceof MockGame) {
                    this.lobbyStats.push( {type: GameWorldType[lobby.type], avgTime: lobby.avgTickTime, lastTime: lobby.lastTickTime, uuid: lobby.shortId } )
                } else {
                    this.lobbyStats.push( {type: GameWorldType[lobby.type], mmr: `${lobby.mmrRange.min}-${lobby.mmrRange.max}`, avgTime: lobby.avgTickTime, lastTime: lobby.lastTickTime, comparisons: lobby.lastComparisons, matches: lobby.lastMatches,  uuid: lobby.shortId } )
                }
            } else {
                // console.log(`Director: addClientToLobby: testLobby rejected PlayerAccount:`, testLobby, player);
            }
        });
        this.disposeQueuedClients();
        this.disposeQueuedGames();
        this.lastTickTime = now() - startTime;
        this.updateAverageTickTime(this.lastTickTime);
    }

    start(): void {
        this._tickInterval = setInterval(this._tickHandler, this._deltaTime);
        PubSub.Instance().start();
    }

    stop(): void {
        clearInterval(this._tickInterval);
        PubSub.Instance().stop();
    }

    updateAverageTickTime(tickTime): void {
		this.avgTickTime += (tickTime - this.avgTickTime) * 0.1;
	}

    getPerformanceStats(): any {
        let clientCount: number = this._authenticatedClientSessions.size;
        this.performanceStats = { lobbies: this._lobbies.size, clients:  clientCount, accounts: Database.getPlayerCount(), disposedClients: this._disposedClientCount, disposedGames: this._disposedGameCount, lobbyStats: this.lobbyStats, lastTickTime: this.lastTickTime, avgTickTime: this.avgTickTime }
        return this.performanceStats
    }

    startConnectionManager(): void {
        this._connectionManager = new ConnectionManager({debug: this.debug, port: this._connectionPort});
    }

    addChatLobby(): ChatLobby {
        let lobby: ChatLobby = new ChatLobby({
            mmrRange: {min: 0, max: 300},
            minClients: 0,
            maxClients: 8,
        });
        this._lobbies.set(lobby.uuid, lobby);
        return lobby;
    }

    get lobyCount(): number {
        return this._lobbies.size;
    }

    get connectionPort(): number {
        return this._connectionPort;
    }

    addLobbyWithPlayerAccount(player: PlayerAccount): Lobby {
        let mmrRange: Range = Lobby.getMMRRangeWithPlayerAccount(player);
        let lobby: Lobby = new Lobby({mmrRange: mmrRange, location: player.location, deltaTime: 3000});
        this._lobbies.set(lobby.uuid, lobby);
        return lobby;
    }

    addClientToLobby(clientProxy: ClientProxy): Lobby {
        let player: PlayerAccount = Database.getPlayerWithUUID(clientProxy.userUUID);
        let lobby: Lobby;
        if (player) {
            this._lobbies.forEach((testLobby: Lobby, key: string) => {
                if ( (testLobby instanceof Lobby) && (testLobby.willAcceptPlayer(player)) ) {
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
            clientProxy.gameWorld = lobby;
        } else {
            throw new Error('Invalid PlayerAccount.');
        }
        return lobby;
    }

    addClientsToMockGame(client1: ClientProxy, client2: ClientProxy) : void {
        let game: MockGame = new MockGame();
        this._lobbies.set(game.uuid, game);
        game.addClient(client1);
        client1.gameWorld = game;
        game.addClient(client2);
        client2.gameWorld = game;
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
        return client;
    }

    addMockClients(count: number): void {
        for (let i=0; i<count; i++) {
            this.addMockClient();
        }
    }

    authenticateUser(authMsg: Msg_Auth): string {
        //TODO: implement authentication
        // console.log(`Director: authenticateUser: `, authMsg);
        let playerAccount: PlayerAccount = Database.generateMockPlayerAccount({mmr: 100});
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

    disposeClient(client: ClientProxy): void {
        this.removeAuthenticatedClientSession(client.userUUID);
        Database.removePlayerAccount(client.playerAccount);
        client.dispose();
    }

    disposeQueuedClients(): void {
        let client: ClientProxy;
        while (client = this._disposeClientQueue.shift()) {
            this._disposedClientCount++;
            this.disposeClient(client);
        }
    }

    disposeLobby(lobby: GameWorld): void {
        this._lobbies.delete(lobby.uuid);
        lobby.dispose();
    }

    disposeAllLobbies(): void {
        this._lobbies.forEach((lobby: Lobby, key: string) => {
            this.disposeLobby(lobby);
        });
    }

    disposeQueuedGames(): void {
        let game: GameWorld;
        while (game = this._disposeGameQueue.shift()) {
            this._disposedGameCount++;
            this.disposeLobby(game);
        }
    }

    handleStartGame(client1: ClientProxy, client2: ClientProxy): void {
        this.addClientsToMockGame(client1, client2);
    }

    handleMockGameOver(game: MockGame, client1: ClientProxy, client2: ClientProxy): void {
        // console.log(game.shortId, client1, client2);
        // for now, dispose clients and remove associated player activeAccounts
        // this.log(`handleGameOver: ${client1.shortId} ${client1.playerAccount.mmr} ${client1.gameTime} <-> ${client2.shortId} ${client2.playerAccount.mmr} ${client2.gameTime}`)

        // this.removeAuthenticatedClientSession(client1.userUUID);
        // this.removeAuthenticatedClientSession(client2.userUUID);
        // Database.removePlayerAccount(client1.playerAccount);
        // Database.removePlayerAccount(client2.playerAccount);
        // client1.dispose();
        // client2.dispose();

        // this.addClientToLobbyQueue(client1);
        // this.addClientToLobbyQueue(client2);

        this._disposeClientQueue.push(client1);
        this._disposeClientQueue.push(client2);

        this._disposeGameQueue.push(game);
    }

    logLobbyStats(): void {
        this._lobbies.forEach((lobby: Lobby, key: string) => {
            console.log(`Director: Lobby count: ${this._lobbies.size} mmrRange: `, lobby.mmrRange);
            lobby.logClients();
        });
    }

    log(msg: string, obj?: any): void {
        console.log(`DIRECTOR: ${msg}: `, obj);
    }
}
