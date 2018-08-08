import Msg_Auth from './Msg_Auth';
import Msg_Chat from './Msg_Chat';
import Message from './Message';

/* From Message
export enum MessageType {
    Auth,
    Chat,
}
*/

export interface RemoteInfo {
	address: string;
	port: number;
	size: number;
}

export default class MessageFactory {
	private static _classMap: Map<number, any>;
    private static msgClz: any[] = [
        Msg_Auth,
        Msg_Chat,
    ];

	static init(): void {
		MessageFactory._classMap = new Map<number, any>();
		MessageFactory.registerMessageClass(Msg_Auth, 0);
		MessageFactory.registerMessageClass(Msg_Chat, 1);
	}

    static parse(messageBuffer: any, rinfo?: RemoteInfo): Message | undefined {
        // console.log(messageBuffer);
        let type: number = messageBuffer[0];
        try {
            let msgClass: any = MessageFactory.msgClz[type];
            let msg: Message = new msgClass() as Message;
            if (rinfo) {
                msg.host = rinfo.address;
                msg.port = rinfo.port;
            }
            msg.load(messageBuffer);
            return msg;
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }

	static registerMessageClass(messageClass: any, type: number): void {
		console.log(`registerMessageClass: type: ${messageClass.type}: `);
		let testClass: any ;
		if (testClass = MessageFactory._classMap.get(messageClass.type) ) {
			console.log(`registerMessageClass: ERROR: type already in use: ${messageClass.type}: `, testClass);
		} else {
			MessageFactory._classMap.set(messageClass.type, messageClass);
		}
	}

	static unRegisterMessageClass(messageClass: any, type: number): void {
		let testClass: any = MessageFactory._classMap.get(messageClass.type);
		if (testClass == messageClass) {
			console.log(`unregisterMessageClass: type: ${messageClass.type}: `);
			MessageFactory._classMap.delete(type);
		} else {
			console.log(`unregisterMessageClass: ERROR: type does not match class: type: ${messageClass.type}: `, messageClass);
		}
	}
}
