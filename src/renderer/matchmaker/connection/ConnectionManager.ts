import TCPClientServer from './TCPClientServer';
import Message from '../message/Message';

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

	public broadcast(message: Message): void {
		this.TCP_s.broadcastMessage(message);
	}

    log(text: string): void {
        if (this.debug) {
            let message: string = "CM: " + text;
            console.log(message);
        }
    }
}
