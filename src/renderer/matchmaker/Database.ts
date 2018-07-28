import PlayerAccount from './PlayerAccount';
import ActiveAccount from './ActiveAccount';

export default class Database {

    static playerAccounts: Map<string, PlayerAccount>;
    static activeAccounts: Map<string, ActiveAccount>;

    static init(): void {
        Database.playerAccounts = new Map<string, PlayerAccount>();
        Database.activeAccounts = new Map<string, ActiveAccount>();
    }

    static addPlayerAccount(playerAccount: PlayerAccount): void {
        Database.playerAccounts.set(playerAccount.uuid, playerAccount);
    }

    static removePlayerAccount(playerAccount: PlayerAccount): void {
        Database.playerAccounts.delete(playerAccount.uuid);
    }

    static addActiveAccount(activeAccount: ActiveAccount): void {
        Database.activeAccounts.set(activeAccount.playerAccount.uuid, activeAccount);
    }

    static removeActiveAccount(activeAccount: ActiveAccount): void {
        Database.playerAccounts.delete(activeAccount.playerAccount.uuid);
    }

    static getActiveAcountWithUUID(uuid: string): ActiveAccount {
        return this.activeAccounts.get(uuid);
    }
}
