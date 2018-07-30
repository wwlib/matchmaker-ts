import * as React from "react";
import * as ReactBootstrap from "react-bootstrap";
import WebSocket = require('ws');

const prettyjson = require('prettyjson');
const sp = require('schemapack');

const messageSchema = sp.build({
    __type: "uint8",
    body: "string"
});

const cert = '-----BEGIN CERTIFICATE-----\n\
CERT\n\
-----END CERTIFICATE-----';

export interface ClientProps { }
export interface ClientState { input: string; messages: string }

export default class Client extends React.Component < ClientProps, ClientState > {

    public hostname = 'localhost';
    public port = 9696;
    public webSocket;

    componentWillMount() {
        this.setState({ input: '<input>', messages: '<messages>' });
    }

    componentDidMount() {
    }

    onButtonClicked(action: string): void {
        // console.log(`onButtonClicked: ${action}`);
        switch (action) {
            case 'connect':
                this.startWebSocket();
                break;
            case 'send':
                this.sendMessage(this.state.input);
                break;
            case 'clear':
                this.setState({ input: '<input>', messages: '<messages>' });
                break;
        }
    }

    startWebSocket(onError?: any, onConnect?: any) {
        let connectionString = `wss://${this.hostname}:${this.port}`;
        console.log(`startWebSocket: ${connectionString}`);

        if (this.webSocket) {
            try {
                this.webSocket.close();
            } catch (e) {
                console.log(e);
            }
            this.webSocket = null;
        }
        try {
            let cas: string[] = [cert];
            this.webSocket = new WebSocket(connectionString, {
                rejectUnauthorized: false,
                ca: cas,
                checkServerIdentity: ((_serverbane: any, cert: any) => {
                    var expected_cert_common_name = 'Common-Name';
                    if (cert.subject.CN !== expected_cert_common_name) {
                        console.log("Certificate CN doesn't match expected CN: " + expected_cert_common_name);
                    }
                    return undefined;
                }),
            });

            this.webSocket.on('error', (e) => {
                if (onError){
                    onError(e);
                }
            });

            this.webSocket.on('open', () => {
                if (onConnect) {
                    onConnect(this.webSocket);
                }

                // let message = {
                //     __type: 1,
                //     body: 'Hello, world'
                // };
                // this.webSocket.send(messageSchema.encode(message));
            });

            this.webSocket.on('message', (message, flags) => {
                console.log(`Client: on message: `, message, flags);
            });

            this.webSocket.on('close', () => {
                console.log('Client: websocket client closed')
                this.webSocket = null;
            });
        } catch (err) {
            this.webSocket = null;
            console.log(err);
        }
    }

    sendMessage(msg: string): void {
        if (this.webSocket) {
            this.webSocket.send(msg);
        }
    }

    clearMessages(): void {
        this.setState({messages: ''});
    }

    handleChange(event: any) {
        let nativeEvent: any = event.nativeEvent;
        this.setState({input: nativeEvent.target.value});
    }

    handleSubmit(event: any) {
        this.sendMessage(this.state.input);
        this.setState({input: ''});
        event.preventDefault();
    }

    render() {
        return(
            <div>
                <textarea name="messages" value={this.state.messages} readOnly style={{width: 800, height: 100}}/>
                <form onSubmit={this.handleSubmit.bind(this)}>
                        <label>Input:</label>
                        <input ref="input" type="text" style = {{width: 800}}
                            value={this.state.input} onChange={this.handleChange.bind(this)} />
                        <input type="submit" value="Send" />
                    </form>
                <div>
                <ReactBootstrap.Button bsStyle={'success'} key={"connect"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "connect")}>connect</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"send"} style = {{width: 120}}
                    onClick={this.onButtonClicked.bind(this, "send")}>send</ReactBootstrap.Button>
                <ReactBootstrap.Button bsStyle={'info'} key={"clear"} style = {{width: 100}}
                    onClick={this.onButtonClicked.bind(this, "clear")}>clear</ReactBootstrap.Button>
                </div>
            </div>
        );
    }
}
