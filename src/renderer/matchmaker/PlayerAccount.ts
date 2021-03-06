const uuidv4 = require('uuid/v4');

export enum PlayerLocation {
    NorthAmericaEast,
    NortAmericaWest,
    Europe,
    Asia
}

export type AccountOptions = {
    uuid: string;
    name: string;
    email: string;
    password: string;
    location: PlayerLocation;
    mmr: number;
    gamesPlayed:number;
    wins: number;
    losses:number;
    quits: number;
}

export enum MMREvent {
    Win,
    Lose,
    Draw,
    Quit,
    Abort
}

export default class PlayerAccount {

    // name, email, pass
    // location, mmr, tos, revenue, total_plays, last_30_days_plays, last_play_time, priority, wait_time, engagement
    // status: in_game, in_lobby
    // lobbies: []
    // max_wait_time (timeout threshold)
    // player_quit_count
    // player_player_rating
    // name, email, pass
    // location, mmr, tos, revenue, total_plays, last_30_days_plays, last_play_time, priority, wait_time, engagement
    // status: in_game, in_lobby
    // lobbies: []
    // max_wait_time (timeout threshold)
    // player_quit_count
    // player_player_rating

    public uuid: string;
    public name: string;
    public email: string;
    public password: string;
    public location: PlayerLocation;
    public mmr: number;
    public gamesPlayed: number;
    public wins: number;
    public losses: number;
    public quits: number;

    constructor(options?: any) {
        options = options || {};
        let defaultOptions: AccountOptions =  {
            uuid: uuidv4(),
            name: 'name',
            email: 'name@email.com',
            password: 'password',
            location: PlayerLocation.NorthAmericaEast,
            mmr: 1000 + Math.floor(100 - Math.random() * 200),
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            quits: 0
        }
        options = Object.assign(defaultOptions, options);

        this.uuid = options.uuid;
        this.name = options.name;
        this.email = options.email;
        this.password = options.password;
        this.location = options.location;
        this.mmr = options.mmr;
        this.gamesPlayed = options.gamesPlayed;
        this.wins = options.wins;
        this.losses = options.losses;
        this.quits = options.quits
    }

    updateStats(mmrEvent: MMREvent): void {
        switch(mmrEvent) {
            case MMREvent.Win:
                this.gamesPlayed++;
                this.wins++;
                break;
            case MMREvent.Lose:
                this.gamesPlayed++;
                this.losses++
                break;
        }
    }

    dispose(): void {
    }
}
