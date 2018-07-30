import Msg_Text from '../message/Msg_Text';
import PlayerAccount from '../PlayerAccount';
import TCPClientServer from './TCPClientServer';

export interface RemoteInfo {
	address: string;
	port: number;
	size: number;
}

export default class ConnectionManager {

	public TCP_s: TCPClientServer;
    public port: number;
    public debug: boolean;


	constructor(options?: any) {
        options = options || {};
        let defaultOptions: any =  {
            debug: true,
            port: 9696,
        }
        options = Object.assign(defaultOptions, options);

        this.debug = options.debug;
        this.port = options.port;

		this.log("Initializing MessageRouter.");
		this.log("Starting Packet Thread.");

		this.TCP_s = new TCPClientServer(this.port, this);
	}

	public restart(): void {
		this.TCP_s.restart();
		this.log("Restarted.");
	}

	// public sendMsg_Text(playerAccount: PlayerAccount, msg: Msg_Text): void {
	// 	playerAccount.tcpClientSession.sendText(msg.body);
	// }

	public broadcast(msg: Msg_Text): void {
		this.TCP_s.broadcastMessage(msg.body);
	}

    log(text: string): void {
        if (this.debug) {
            let message: string = "CM: " + text;
            console.log(message);
        }
    }
}
