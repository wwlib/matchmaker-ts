import PlayerAccount from './PlayerAccount';
import LobbyAccount from './LobbyAccount';
import Lobby from './Lobby';

const EloRank = require('elo-rank');
const elo = new EloRank(32);

export default class Matchmaker {

    private static _instance: Matchmaker;

    public lobby: Lobby;

    constructor() {
        this.lobby = new Lobby();
    }

    static get Instance()
    {
        return this._instance || (this._instance = new this());
    }

    updateMMR(winner: PlayerAccount, loser: PlayerAccount): void {
        //Gets expected score for first parameter
        var expectedScoreA = elo.getExpected(winner.mmr, loser.mmr);
        var expectedScoreB = elo.getExpected(loser.mmr, winner.mmr);

        //update score, 1 if won 0 if lost
        winner.mmr = elo.updateRating(expectedScoreA, 1, winner);
        loser.mmr = elo.updateRating(expectedScoreB, 0, loser);
    }

    addLobbyAccountToLobby(lobbyAccount: LobbyAccount): void {
        this.lobby.addLobbyAccount(lobbyAccount);
        lobbyAccount.lobby = this.lobby;
    }
}
