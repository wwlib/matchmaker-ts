import ConnectionManager from './ConnectionManager';
import TCPClientSession, { MockWebSocket } from './TCPClientSession';
import Message from '../message/Message';
// import TCPClientMonitor from './TCPClientMonitor';
import WebSocket = require('ws');
const fs = require('fs');
const https = require('https');

export default class TCPClientServer {
	public socketServer: WebSocket.Server;
	public nextClientID: number;
	// public TCP_m: TCPClientMonitor;

	public clients: Map<TCPClientSession, WebSocket | MockWebSocket> = new Map<TCPClientSession, WebSocket | MockWebSocket>();
	public connectionManager: ConnectionManager;
	public host: string;
	public port: number;

	constructor(port: number, connectionManager: ConnectionManager) {
		this.port = port;
		this.connectionManager = connectionManager;
		console.log("Initializing TCP_s.");
		this.start();
	}

	// this.clients.forEach((socket: WebSocket, client: TCPClientSession) => {
	//
	// });

	public restart(): void {
		this.clients.forEach((socket: WebSocket, client: TCPClientSession) => {
			console.log("Killing: " + client.ip + ":" + client.port);
			client.dispose();
		});
		this.clients = new Map<TCPClientSession, WebSocket>();
		console.log("Restarted.");
	}

	public start(): void {
		var processRequest = function( req: any, res: any ) {
			console.log(`processRequest: `, req);
			res.writeHead(200);
			res.end("OK\n");
		};

		var cfg = {
			ssl: false,
			port: 9696,
			//FIXME: the path should be relative
			ssl_key: "certs/key.pem",
			ssl_cert: "certs/certificate.pem",
		};

		var httpsServer = https.createServer({
			// providing server with  SSL key/cert
			key: fs.readFileSync( cfg.ssl_key ),
			cert: fs.readFileSync( cfg.ssl_cert )
		}, processRequest ).listen( cfg.port );


		console.log(`SocketServer: starting server: host ${this.host}, port ${this.port}`);
		this.socketServer = new WebSocket.Server({
			server: httpsServer,
		});
		// this.socketServer = new WebSocket.Server({
		//     port: 9696
		// });

		this.socketServer.on('connection', (socket: any, req: any) => { //FIXME: WebSocket
			console.log(`SocketServer: on connection`);
			var terms = req.headers.host.split(':');
			socket.host = terms[0];
			socket.port = Number(terms[1]);
			console.log(req.headers.host, terms, socket.host, socket.port);
			this.onConnection(socket);
		});

		this.socketServer.on('error', (error: any) => {
			console.log(`SocketServer: on error: `, error);
			this.killServer();
		});
	}

	onConnection(socket: WebSocket | MockWebSocket): TCPClientSession {
		let client: TCPClientSession = new TCPClientSession(this, socket);
		console.log(`${client.ip} : ${client.port} connected to the server.`);
		this.clients.set(client, socket);
		client.sendText('CONNECTED_OK');
		return client;
	}

	public broadcastMessage(message: Message): void {
		this.clients.forEach((socket: WebSocket, client: TCPClientSession) => {
			client.sendMessage(message);
		});
	}

	private killServer(): void {
		try {
			this.socketServer.close();
			console.log("Server Stopped");
		} catch (err) {
			console.log("Error while stopping Server:");
			console.log(err);
		}
	}

	public removeTCPClient(client: TCPClientSession): void {
		console.log(`Removing client: ${client.userUUID}`);
		client.dispose();
		this.clients.delete(client);
	}

	public timeoutTCPClient(client: TCPClientSession): void {
		console.log("Timing out client: " + client.ip + ":" + client.port);
		this.clients.delete(client);

	}
}
