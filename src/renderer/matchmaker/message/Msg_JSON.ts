import Message from './Message';

const sp = require('schemapack');

const messageSchema = sp.build({
    __type: "uint8",
    name: "string",
    json: "buffer",
});

export type JSONMessageOptions = {
    name?: string;
    json?: any;
}

export default class Msg_Chat extends Message {

    static type: number = 2;

    public name: string;
	public json: any;

    constructor(options?: JSONMessageOptions) {
        super();
        options = options || {};
        let defaultOptions: JSONMessageOptions =  {
            name: '',
            json: {},
        }
        options = Object.assign(defaultOptions, options);

        this.name = options.name;
        this.json = Buffer.from(JSON.stringify(options.json));
	}

	public getBytes(): any {
		var message = {
			__type: this.getType(),
            name: this.name,
			json: this.json,
		};
		return messageSchema.encode(message);
	}

	public load(buffer: any): void { // throws PacketDataNotApplicableException {
		var payload = messageSchema.decode(buffer);
		if (payload) {
			if (payload.__type == this.getType()) {
                this.name = payload.name,
    			this.json = JSON.parse(payload.json)
			} else {
				console.log(`Expecting MessageType: ${this.getType()} but got: ${payload.__type}`)
			}
		} else {
			console.log(`Unable to decode message buffer.`);
		}
	}

	public getType(): number {
		return Msg_Chat.type;
	}
}
