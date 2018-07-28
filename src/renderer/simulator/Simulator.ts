import PlayerAccount from '../matchmaker/PlayerAccount';
import LobbyAccount from '../matchmaker/LobbyAccount';
import Player from './Player';
import Game, { GameState, GameOptions } from './Game';
import Database from '../matchmaker/Database';
import Matchmaker from '../matchmaker/Matchmaker';

const accountData: any = require('../../../data/accounts');
// const accountData: any = [
// {"name": "a", "email": "a@email.com", "password": "pass", "mmr": 500},
// {"name": "b", "email": "b@email.com", "password": "pass", "mmr": 500},
// ]

export default class Simulator {

    public games: Map<string, Game> = new Map<string, Game>();

    private _updateHandler: any = this.update.bind(this);
    private _game: Game;

    constructor() {
        this._game = new Game({ maxDuration: 3000, maxWaitTime: 3000, minPlayers: 2, maxPlayers: 2});
        this.games.set(this._game.uuid, this._game);
        let account1: PlayerAccount = new PlayerAccount(accountData[0]);
        let account2: PlayerAccount = new PlayerAccount(accountData[1]);
        let player1: Player = new Player(account1, { maxWaitTime: 10000, bailProbability: 0.01, quitProbability: 0.001});
        let player2: Player = new Player(account2, { maxWaitTime: 10000, bailProbability: 0.01, quitProbability: 0.001});

        // this._game.addPlayer(player1);
        setTimeout(() => this._game.addPlayer(player1), 1000);
        setTimeout(() => this._game.addPlayer(player2), 2000);

        this._game.on('spawned', (data: any) => console.log(`spawned: ${data.uuid}`));
        this._game.on('player-added', (data: any) => console.log(`player-added: ${data.uuid} ${data.account.name}`));
        this._game.on('player-removed', (data: any) => console.log(`player-removed: ${data.uuid} ${data.account.name}`));
        this._game.on('started', (data: any) => console.log(`started: ${data.uuid}`));
        this._game.on('done', (data: any) => console.log(`done: ${data.uuid}, ${data.state}, ${data.elapsed}`));

        Database.init();
        this.spawnAccounts(10);

        this.start();
    }

    get json(): any {
        let json: any = {};
        json.games = [];
        json.gameCount = this.games.size;
        this.games.forEach((game: Game, uuid: string) => {
            json.games.push(game.json);
        });
        return json;
    }

    start(): void {
        console.log(`start: `, this._game);
        window.requestAnimationFrame(this._updateHandler);
    }

    update(): void {
        if (this._game && this._game.state != GameState.Done && this._game.state != GameState.Aborted) {
            this._game.tick();
        }

        window.requestAnimationFrame(this._updateHandler);
    }

    spawnAccounts(count: number): void {
        for (let i: number=0; i<=count; i++) {
            let playerAccount = new PlayerAccount();
            Database.addPlayerAccount(playerAccount);
            Database.addLobbyAccount(new LobbyAccount(playerAccount));
        }
    }

    activateAccounts(): void {
        Database.playerAccounts.forEach((playerAccount: PlayerAccount, uuid: string) => {
            if (!Database.getLobbyAccountWithUUID(uuid)) {
                let lobbyAccount: LobbyAccount = new LobbyAccount(playerAccount);
                Matchmaker.Instance.addLobbyAccountToLobby(lobbyAccount);
            }
        });
    }
}
