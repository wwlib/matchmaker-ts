import Message, { MessageType } from './Message';

const sp = require('schemapack');

const messageSchema = sp.build({
    __type: "uint8",
    id: "string",
    authToken: "string",
    targetHost: "string",
    targetPort: "string",
    body: "string"
});

export default class Msg_Chat extends Message {

    public accessLevel: number = 0;
    public authToken: string;
	public targetHost: string;
	public targetPort: string;
	public body: string;
    public p2p: boolean;

    constructor() {
		super();
	}

	public getBytes(): any {
		var message = {
			__type: this.getType(),
			id: this._id,
            authToken: this.authToken,
			targetHost: this.targetHost,
			targetPort: this.targetPort,
			body: this.body
		};
		return messageSchema.encode(message);
	}

	public load(buffer: any): void { // throws PacketDataNotApplicableException {
		var payload = messageSchema.decode(buffer);
		if (payload) {
			if (payload.__type == this.getType()) {
				this._id = payload.id;
                this.authToken = payload.authToken,
    			this.targetHost = payload.targetHost,
    			this.targetPort = payload.targetPort,
    			this.body = payload.body,
                this.p2p = (this.targetHost == 'ALL');
			} else {
				console.log(`Expecting MessageType: ${this.getType()} but got: ${payload.__type}`)
			}
		} else {
			console.log(`Unable to decode message buffer.`);
		}
	}

	public getType(): number {
		return MessageType.Chat;
	}
}
