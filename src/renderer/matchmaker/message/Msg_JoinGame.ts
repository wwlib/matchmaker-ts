import Message, { MessageType } from './Message';

const sp = require('schemapack');

const messageSchema = sp.build({
    __type: "uint8",
    id: "string",
    guid: "string"
});

export default class Msg_JoinGame extends Message {

	public guid: string;

	constructor(guid: string) {
		super();
        this.guid = guid;
	}

	public getBytes(): any {
		var message = {
			__type: this.getType(),
			id: this._id,
			guid: this.guid
		};
		return messageSchema.encode(message);
	}

	public load(buffer: any): void { // throws PacketDataNotApplicableException {
		var payload = messageSchema.decode(buffer);
		if (payload) {
			if (payload.__type == this.getType()) {
				this._id = payload.id;
				this.guid = payload.guid;
			} else {
				console.log(`Expecting MessageType: ${this.getType()} but got: ${payload.__type}`)
			}
		} else {
			console.log(`Unable to decode message buffer.`);
		}
	}

	public getType(): number {
		return MessageType.JoinGame;
	}
}
