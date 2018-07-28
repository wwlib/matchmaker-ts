import LobbyAccount from './LobbyAccount';

const uuidv4 = require('uuid/v4');

export enum Location {
    NorthAmericaEast,
    NortAmericaWest,
    Europe,
    Asia
}

export type Range = {
    min: number;
    max: number;
}

export type LobbyOptions = {
    uuid: string;
    memberRange: Range;
    location: Location;
    mmrRange: Range;
    latencyRange: Range;
    priorityRange: Range;
}

export default class Lobby {

    public uuid: string;
    public activeAccounts: Map<string, LobbyAccount> = new Map<string, LobbyAccount>();
    public memberRange: Range;
    public location: Location;
    public mmrRange: Range;
    public latencyRange: Range;
    public priorityRange: Range;

    constructor(options?: any) {
        options = options || {};
        let defaultOptions: LobbyOptions =  {
            uuid: uuidv4(),
            memberRange: {min: 10, max: 20},
            location: Location.NorthAmericaEast,
            mmrRange: {min: 400, max: 600},
            latencyRange: {min: 10, max: 100},
            priorityRange: {min: 0, max: 3}
        }
        options = Object.assign(defaultOptions, options);

        this.memberRange = options.memberRange;
        this.location = options.location;
        this.mmrRange = options.mmrRange;
        this.latencyRange = options.latencyRange;
        this.priorityRange = options.priorityRange;
    }

    addLobbyAccount(lobbyAccount: LobbyAccount): void {
        this.activeAccounts.set(lobbyAccount.playerAccount.uuid, lobbyAccount);
    }

    removeLobbyAccount(lobbyAccount: LobbyAccount): void {
        lobbyAccount.lobby = null;
        this.activeAccounts.delete(lobbyAccount.playerAccount.uuid);
    }

    getMatchedPlayers(count: number = 2): LobbyAccount[] {
        let result: LobbyAccount[] = [];
        this.activeAccounts.forEach((lobbyAccount: LobbyAccount, uuid: string) => {
            if (result.length < count) {
                result.push(lobbyAccount);
                this.removeLobbyAccount(lobbyAccount);
            }
        });
        return result;
    }
}
