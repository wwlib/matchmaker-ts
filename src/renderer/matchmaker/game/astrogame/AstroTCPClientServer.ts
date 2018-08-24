import WebSocket = require('ws');
import TCPClientServer from '../../connection/TCPClientServer';
import TCPClientSession, { MockWebSocket } from '../../connection/TCPClientSession';
import AstroTCPClientSession from './AstroTCPClientSession';
import Msg_Auth from '../../message/Msg_Auth';
import AstroGame from './AstroGame';

export default class AstroTCPClientServer extends TCPClientServer {

    public astroGame: AstroGame | undefined;

    constructor(port: number, astroGame: AstroGame) {
        super(port);
        this.astroGame = astroGame;
    }

    onConnection(socket: WebSocket | MockWebSocket): TCPClientSession {
        let client: AstroTCPClientSession = new AstroTCPClientSession(socket, this.astroGame);
        // console.log(`${client.ip} : ${client.port} connected to the server.`);
        this.clients.set(client, socket);
        let authMsg: Msg_Auth = new Msg_Auth({
            command: 'connected'
        });
        client.sendMessage(authMsg);
        return client;
    }

    dispose(): void {
        super.dispose();
        this.astroGame = undefined;
    }
}
