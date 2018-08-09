// import PubSub from '../PubSub';
import Director, { DirectorTopic } from '../../Director';
import GameWorld, { GameWorldType, GameWorldState } from '../GameWorld';
import Lobby, { LobbyOptions } from '../Lobby';
import ClientProxy from '../../ClientProxy';
import PlayerAccount, { PlayerLocation } from '../../PlayerAccount';
import Database from '../../Database';
import MessageFactory from '../../message/MessageFactory';
import Msg_Astro from './Msg_Astro';

import AstroTCPClientServer from './AstroTCPClientServer';
import AstroTCPClientSession from './AstroTCPClientSession';

const now = require("performance-now");

export default class AstroGame extends GameWorld {

    public maxTime: number = 3000;
    public server: AstroTCPClientServer;
    public connectionPort: number;

    private _startTime: number;

    constructor(options?: any) {
        super(options);
        this.connectionPort = 9595;
        if (options && options.connectionPort) {
            this.connectionPort = options.connectionPort;
        }
        MessageFactory.registerMessageClass(Msg_Astro, Msg_Astro.type);
        this.start();
    }

    tick(): number {
        this.startTick();
        // if ((now() - this._startTime) >= this.maxTime) {
        //     let clients: ClientProxy[] = Array.from(this._clients.values());
        //     this.dispose();
        //     Director.Instance().handleAstroGameOver(this, clients[0], clients[1]);
        // }
        this.endTick();
        return 0;
    }

    start(): void {
        this._startTime = now();
        this.server = new AstroTCPClientServer(this.connectionPort);

    }

    dispose(): void {
        super.dispose();
        MessageFactory.registerMessageClass(Msg_Astro, Msg_Astro.type);
        this.server.dispose();
    }
}
