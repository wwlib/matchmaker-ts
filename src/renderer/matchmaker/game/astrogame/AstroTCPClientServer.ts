import WebSocket = require('ws');
import TCPClientServer from '../../connection/TCPClientServer';
import TCPClientSession, { MockWebSocket } from '../../connection/TCPClientSession';
import AstroTCPClientSession from './AstroTCPClientSession';
import Msg_Auth from '../../message/Msg_Auth';

export default class AstroTCPClientServer extends TCPClientServer {

    constructor(port: number) {
        super(port)
    }

    onConnection(socket: WebSocket | MockWebSocket): TCPClientSession {
        let client: AstroTCPClientSession = new AstroTCPClientSession(socket);
        // console.log(`${client.ip} : ${client.port} connected to the server.`);
        this.clients.set(client, socket);
        let authMsg: Msg_Auth = new Msg_Auth({
            command: 'connected'
        });
        client.sendMessage(authMsg);
        return client;
    }
}
