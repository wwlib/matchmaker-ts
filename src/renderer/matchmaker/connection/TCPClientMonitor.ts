/*
import TCPClientSession from './TCPClientSession';
import TCPClientServer from './TCPClientServer';
import RTMPGameSubsystem from './RTMPGameSubsystem';

export default class TCPClientMonitor extends RTMPGameSubsystem { //implements Runnable{

	public server: TCPClientServer;
	private _runInterval: any;
	private _runHandler: any = this.tick.bind(this);

	public TCPClientMonitor(server: TCPClientServer) {
		this.server = server;
		this.subsystemName = "TCP_cm";
		this.debugMode = true;
		this.sysOut("Initializing TCP_m.");
		this._runInterval = setInterval(this._runHandler, 1000 * 3);
	}

	public tick(): void {
		this.server.clients.forEach((socket: WebSocket, client: TCPClientSession) => {
			let elapsedTime: number = performance.now() - client.lastMessageReceivedTime;
			this.debug("checking: " + client.getIP() + ":" + client.getPort() + "[" + elapsedTime + "]");
			if (false && elapsedTime >= 11000) {
				//kill client
				client.timeoutClient();
			} else if (false && elapsedTime >= 7000) {
				//tell client to reconnect
				if (client.player != null) {
					this.server.messageRouter.server.PM.sendPlayerReconnect(client.player);
				} else {
					this.debug("checking: player is null");
				}
			} else if (elapsedTime >= 3000) {
				//ping client
				if (client.player != null) {
					this.server.messageRouter.server.PM.sendPlayerPing(client.player);
				} else {
					this.debug("checking: player is null");
				}
			}
		});

	}

	stop(): void {
		clearInterval(this._runInterval);
	}
}
*/
