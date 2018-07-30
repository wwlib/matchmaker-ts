import Message, { MessageType } from './Message';

const sp = require('schemapack');

const messageSchema = sp.build({
    __type: "uint8",
    body: "string"
});

export default class Msg_Text extends Message {

	public body: string;

	constructor(body: string) {
		super();
		this.body = body;
	}

	public getBytes(): any {
		var message = {
			__type: MessageType.Text,
			body: this.body
		};
		return messageSchema.encode(message);
	}

	public load(buffer: any): void { //throws PacketDataNotApplicableException {
		var payload = messageSchema.decode(buffer);
		if (payload) {
			if (payload.__type == MessageType.Text) {
				this.body = payload.body;
			} else {
				console.log(`Expecting MessageType: ${this.getType()} but got: ${payload.__type}`)
			}
		} else {
			console.log(`Unable to decode message buffer.`);
		}
	}

	public getType(): number {
		return MessageType.Text;
	}
}
