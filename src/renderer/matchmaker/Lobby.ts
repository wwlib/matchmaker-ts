import ActiveAccount from './ActiveAccount';

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
    memberRange: Range;
    location: Location;
    mmrRange: Range;
    latencyRange: Range;
    priorityRange: Range;
}

export default class Lobby {

    public activeAccounts: Map<string, ActiveAccount> = new Map<string, ActiveAccount>();
    public memberRange: Range;
    public location: Location;
    public mmrRange: Range;
    public latencyRange: Range;
    public priorityRange: Range;

    constructor(options?: LobbyOptions) {
        options = options || {
            memberRange: {min: 10, max: 20},
            location: Location.NorthAmericaEast,
            mmrRange: {min: 400, max: 600},
            latencyRange: {min: 10, max: 100},
            priorityRange: {min: 0, max: 3}
        }

        this.memberRange = options.memberRange;
        this.location = options.location;
        this.mmrRange = options.mmrRange;
        this.latencyRange = options.latencyRange;
        this.priorityRange = options.priorityRange;
    }

    addActiveAccount(activeAccount: ActiveAccount): void {
        this.activeAccounts.set(activeAccount.playerAccount.uuid, activeAccount);
    }

    removeActiveAccount(activeAccount: ActiveAccount): void {
        activeAccount.lobby = null;
        this.activeAccounts.delete(activeAccount.playerAccount.uuid);
    }

    getMatchedPlayers(count: number = 2): ActiveAccount[] {
        let result: ActiveAccount[] = [];
        this.activeAccounts.forEach((activeAccount: ActiveAccount, uuid: string) => {
            if (result.length < count) {
                result.push(activeAccount);
                this.removeActiveAccount(activeAccount);
            }
        });
        return result;
    }
}
