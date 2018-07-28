import PlayerAccount from './PlayerAccount';
import LobbyAccount from './LobbyAccount';

export default class Database {

    static playerAccounts: Map<string, PlayerAccount>;
    static lobbyAccounts: Map<string, LobbyAccount>;

    static init(): void {
        Database.playerAccounts = new Map<string, PlayerAccount>();
        Database.lobbyAccounts = new Map<string, LobbyAccount>();
    }

    static addPlayerAccount(playerAccount: PlayerAccount): void {
        Database.playerAccounts.set(playerAccount.uuid, playerAccount);
    }

    static removePlayerAccount(playerAccount: PlayerAccount): void {
        Database.playerAccounts.delete(playerAccount.uuid);
    }

    static addLobbyAccount(lobbyAccount: LobbyAccount): void {
        Database.lobbyAccounts.set(lobbyAccount.playerAccount.uuid, lobbyAccount);
    }

    static removeLobbyAccount(lobbyAccount: LobbyAccount): void {
        Database.playerAccounts.delete(lobbyAccount.playerAccount.uuid);
    }

    static getLobbyAccountWithUUID(uuid: string): LobbyAccount {
        return this.lobbyAccounts.get(uuid);
    }
}
