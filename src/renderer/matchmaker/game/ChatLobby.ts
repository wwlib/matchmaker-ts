import * as PubSubJS from 'pubsub-js';
import Director, { DirectorTopic } from '../Director';
import GameWorld, { GameWorldType, GameWorldState } from './GameWorld';
import Lobby, { LobbyOptions } from './Lobby';
import ClientProxy from '../ClientProxy';
import PlayerAccount, { PlayerLocation } from '../PlayerAccount';
import Database from '../Database';

export default class ChatLobby extends Lobby {

    constructor(options?: any) {
        super(options);
    }

    tick(): number {
        return 0;
    }

    start(): void {

    }

    dispose(): void {
        super.dispose();
    }
}
