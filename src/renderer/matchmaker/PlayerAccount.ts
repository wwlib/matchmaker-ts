export type AccountData = {
    name: string;
    email: string;
    password: string;
    mmr: number;
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

    public name: string;
    public email: string;
    public password: string;
    public mmr: number;

    constructor(data: AccountData) {
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.mmr = data.mmr;
    }
}
