// import WebSocket = require('ws');
import TCPClientSession from '../../connection/TCPClientSession';
import Msg_Auth from '../../message/Msg_Auth';
import Msg_Chat from '../../message/Msg_Chat';
import Msg_Astro from './Msg_Astro';

// import PubSub, { PubSubClient } from '../../PubSub';
import Message from '../../message/Message';
import MessageFactory from '../../message/MessageFactory';
// import Msg_Chat from '../../message/Msg_Chat';
// import TCPClientServer from '../../connection/TCPClientServer';
import Director from '../../Director';

const now = require("performance-now");

export default class AstroTCPClientSession extends TCPClientSession {

    onMessage(message: any): void {
		// console.log(`AstroTCPClientSession: onMessage: `, message);
		this.lastMessageReceivedTime = now();
		let rinfo: any = {address: this._ip, port: this._port};
		let msg: Message = MessageFactory.parse(message, rinfo);
		if (msg) {
			let message_type: number = msg.getType();

			switch (message_type) {
				case Msg_Auth.type:
					let authMsg: Msg_Auth = msg as Msg_Auth;
					authMsg.host = this._ip;
					authMsg.port = this._port;
					console.log(`  --> AstroTCPClientSession: received Msg_Auth: `, authMsg.command);
					this.userUUID = `PLAYER-${Math.floor(Math.random()*1000)}`; //Director.Instance().authenticateUser(authMsg); //TODO: add real authentication flow
					authMsg.userUUID = this.userUUID;
					authMsg.password = '';
					authMsg.authToken = '<AUTH-TOKEN>';
					authMsg.command = 'authorized';
					this.sendMessage(authMsg); // ACK
					break;
				case Msg_Chat.type:
					console.log(`  --> AstroTCPClientSession: received Msg_Chat: `);
					//this.publish(message);
                    this.sendMessage(msg); // ECHO
					break;
                case Msg_Astro.type:
                    console.log(`  --> AstroTCPClientSession: received Msg_Astro: `);
                    //this.publish(message);
                    this.sendMessage(msg); // ECHO
                    break;
				default:
					console.log("  --> AstroTCPClientSession: unrecognized message type.");
					break;
			}
		} else {
			console.log(`  --> AstroTCPClientSession: unrecognized message format: `, message);
		}
	}

}
