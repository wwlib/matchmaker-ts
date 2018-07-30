import Message, { MessageType } from './Message';

const sp = require('schemapack');

const messageSchema = sp.build({
    __type: "uint8",
    id: "string",
    authToken: "string",
    targetUUID: "string",
    body: "string",
    direct: "boolean"
});

export type ChatMessageOptions = {
    id?: string;
    authToken?: string;
    targetUUID?: string;
    body?: string;
    direct?: boolean;
}

export default class Msg_Chat extends Message {

    public authToken: string;
	public targetUUID: string;
	public body: string;
    public direct: boolean;

    constructor(options?: ChatMessageOptions) {
        super();
        options = options || {};
        let defaultOptions: ChatMessageOptions =  {
            id: '',
            authToken: '',
            targetUUID: '',
            body: '',
            direct: false
        }
        options = Object.assign(defaultOptions, options);

        this._id = options.id;
        this.authToken = options.authToken;
        this.targetUUID = options.targetUUID;
        this.body = options.body;
        this.direct = options.direct;
	}

	public getBytes(): any {
		var message = {
			__type: this.getType(),
			id: this._id,
            authToken: this.authToken,
			targetUUID: this.targetUUID,
			body: this.body,
			direct: this.direct
		};
		return messageSchema.encode(message);
	}

	public load(buffer: any): void { // throws PacketDataNotApplicableException {
		var payload = messageSchema.decode(buffer);
		if (payload) {
			if (payload.__type == this.getType()) {
				this._id = payload.id;
                this.authToken = payload.authToken,
    			this.targetUUID = payload.targetUUID,
    			this.body = payload.body,
                this.direct = payload.direct;
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
