import * as PubSubJS from 'pubsub-js';
import ConnectionManager from './connection/ConnectionManager';
import TCPClientSession, { MockWebSocket } from './connection/TCPClientSession';
import Lobby from './game/Lobby';
import ClientProxy from './ClientProxy';
import Msg_Auth from './message/Msg_Auth';

const uuidv4 = require('uuid/v4');

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
}

export default class Director {

    private static _instance: Director;

    public uuid: string;
    public mode: DirectorMode;

    private _connectionManager: ConnectionManager;
    private _lobbyToken: any;
    private _lobbies: Map<string, Lobby> = new Map<string, Lobby>();

    constructor( options?: DirectorOptions) {
        options = options || {};
        let defaultOptions: DirectorOptions =  {
            uuid: uuidv4(),
			mode: DirectorMode.Primary
        }
		options = Object.assign(defaultOptions, options);

		this.uuid = options.uuid;
		this.mode = options.mode;

        if (this.mode == DirectorMode.Primary) {
            this.createGlobalChanels();
        }

        this._connectionManager = new ConnectionManager();
    }

    static Instance(options?: DirectorOptions)
    {
        return this._instance || (this._instance = new this(options));
    }

    createGlobalChanels(): void {
        this._lobbyToken = PubSubJS.subscribe(DirectorTopic.Lobby, this.lobbySubscriber.bind(this));
    }

    lobbySubscriber(msg: string, data: any): void {
        this.log(`lobbySubscriber : msg: ${msg}`, data);
    }

    addLobby(): Lobby {
        let lobby: Lobby = new Lobby();
        this._lobbies.set(lobby.uuid, lobby);
        return lobby;
    }

    addClientToLobby(clientProxy: ClientProxy): void {
        let lobbies: Lobby[] = Array.from(this._lobbies.values());
        if (lobbies.length > 0){
            let lobby: Lobby = lobbies[0];
            clientProxy.gameWorld = lobby;
            lobby.addClient(clientProxy);
        }
    }

    addMockClient(): ClientProxy {
        let mockWebSocket: MockWebSocket = {
            host: '0',
            port: 0,
            on: () => {},
            send:  (msg: any) => {console.log(`socket:send: `, msg)},
        }
        let clientSession: TCPClientSession = this._connectionManager.TCP_s.onConnection(mockWebSocket);
        clientSession.userUUID = uuidv4();
        let client: ClientProxy = new ClientProxy(clientSession.userUUID);
        this.addClientToLobby(client);
        return client;
    }

    authenticateUser(authMsg: Msg_Auth): string {
        //TODO: implement authentication
        console.log(`Director: authenticateUser: `, authMsg);
        let userUUID: string = uuidv4();
        let client: ClientProxy = new ClientProxy(userUUID);
        this.addClientToLobby(client);
        return userUUID;
    }

    log(msg: string, obj?: any): void {
        console.log(`DIRECTOR: ${msg}: `, obj);
    }
}
