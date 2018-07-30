import PlayerAccount from './PlayerAccount';
// import Lobby from './Lobby';

export default class LobbyAccount {

    public playerAccount: PlayerAccount;

    // private _lobby: Lobby;
    private _lobbyStartTime: number;
    private _spawnTime: number;


    constructor(playerAccount: PlayerAccount) {
        this.playerAccount = playerAccount;
        this._spawnTime = performance.now();
    }

    // set lobby(lobby: Lobby) {
    //     this._lobbyStartTime = performance.now();
    //     this._lobby = lobby;
    // }

    get lobbyWaitTime(): number {
        return performance.now() - this._lobbyStartTime;
    }

    get aliveTime(): number {
        return performance.now() - this._spawnTime;
    }
}
