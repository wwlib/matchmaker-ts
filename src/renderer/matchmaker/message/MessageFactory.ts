import Msg_Chat from './Msg_Chat';
import Msg_JoinGame from './Msg_JoinGame';
import Msg_Text from './Msg_Text';
import Msg_Auth from './Msg_Auth';
import Message, { MessageType } from './Message';
import { RemoteInfo } from '../connection/ConnectionManager';
import TCPClientSession from '../connection/TCPClientSession';

/* From Message
export enum MessageType {
    Auth,
    Text,
	JoinGame,
    Admin,
    Chat,
}
*/

export default class MessageFactory {
    private static msgClz: any[] = [
        Msg_Auth,
        Msg_Text,
        Msg_JoinGame,
        Msg_Chat,
    ];

    constructor() { }

    static parse(messageBuffer: any, rinfo: RemoteInfo, tcpClientSession: TCPClientSession): Message | undefined {
        let type: number = messageBuffer[0];
        try {
            let msgClass: any = MessageFactory.msgClz[type];
            let msg: Message = new msgClass(tcpClientSession) as Message;
            msg.host = rinfo.address;
            msg.port = rinfo.port;
            msg.load(messageBuffer);
            return msg;
        } catch (err) {
            console.log(err);
            return undefined;
        }
    }
}
