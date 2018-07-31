import PlayerAccount from './PlayerAccount';

export default class Database {

    static playerAccounts: Map<string, PlayerAccount>;

    static init(): void {
        Database.playerAccounts = new Map<string, PlayerAccount>();
    }

    static generateMockPlayerAccount(options?: any): PlayerAccount {
        let mockPlayerAccount: PlayerAccount = new PlayerAccount(options);
        Database.addPlayerAccount(mockPlayerAccount);
        return mockPlayerAccount;
    }

    static addPlayerAccount(playerAccount: PlayerAccount): void {
        Database.playerAccounts.set(playerAccount.uuid, playerAccount);
    }

    static removePlayerAccount(playerAccount: PlayerAccount): void {
        Database.playerAccounts.delete(playerAccount.uuid);
    }

    static getPlayerWithUUID(uuid: string): PlayerAccount {
        return Database.playerAccounts.get(uuid);
    }
}
