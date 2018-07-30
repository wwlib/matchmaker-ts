import Message, { MessageType } from './Message';

const sp = require('schemapack');

const messageSchema = sp.build({
    __type: "uint8",
    id: "string",
    authToken: "string",
    password: "string",
    command: "string",
    data: "string"
});

export default class Msg_Auth extends Message {

	public command: string;
	public data: string;
	public accessLevel: number = 0;
    public authToken: string;

	constructor() {
		super();
	}

	public getBytes(): any {
		var message = {
			__type: this.getType(),
			id: this._id,
            authToken: this.authToken,
			password: this._password,
			command: this.command,
			data: this.data
		};
		return messageSchema.encode(message);
	}

	public load(buffer: any): void { // throws PacketDataNotApplicableException {
		var payload = messageSchema.decode(buffer);
		if (payload) {
			if (payload.__type == this.getType()) {
				this._id = payload.id;
				this._password = payload.password;
                this.command = payload.command,
    			this.data = payload.data
			} else {
				console.log(`Expecting MessageType: ${this.getType()} but got: ${payload.__type}`)
			}
		} else {
			console.log(`Unable to decode message buffer.`);
		}
	}

	public getType(): number {
		return MessageType.Auth;
	}
}
