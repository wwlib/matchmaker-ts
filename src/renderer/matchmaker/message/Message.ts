// import Player from './Player';
import TCPClientSession from '../connection/TCPClientSession';

export enum MessageType {
    Auth,
    Text,
	JoinGame,
    Admin,
    Chat,
}

export default abstract class Message {

    protected _id: string;
    protected _password: string;
	public port: number;
	public host: string;
	public serialNumber: number = 1;

	public abstract getBytes(): any;
	public abstract load(buffer: any): void;
	public abstract getType(): number;

    private _tcpClientSession: TCPClientSession;

    get id(): string {
        return this._id;
    }

    get password(): string {
        return this._password;
    }

    public get tcpClientSession(): TCPClientSession {
        return this._tcpClientSession;
    }

    public set tcpClientSession(session: TCPClientSession) {
        this._tcpClientSession = session;
    }
}
