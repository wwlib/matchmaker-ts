
import Director, { DirectorMode } from '../src/renderer/matchmaker/Director';
import Lobby from '../src/renderer/matchmaker/game/Lobby';
import PlayerAccount, { PlayerLocation } from '../src/renderer/matchmaker/PlayerAccount';
import Database from '../src/renderer/matchmaker/Database';
import ClientProxy from '../src/renderer/matchmaker/ClientProxy';

import { expect } from 'chai';
import 'mocha';

describe('Director default mode', () => {
    it('should be in Primary mode', () => {
        Director.Instance({debug: false});
        expect(Director.Instance().mode).to.deep.equal(DirectorMode.Primary);
    });
});

describe('Director addLobbyWithPlayerAccount', () => {
    it('should create a lobby with mmrRange: {min: 601, max: 1000}', () => {
        const player: PlayerAccount = new PlayerAccount({ mmr: 960 });
        const lobby = Director.Instance().addLobbyWithPlayerAccount(player);
        expect(lobby.mmrRange).to.deep.equal({min: 601, max: 1000});
        expect(lobby.location).to.equal(PlayerLocation.NorthAmericaEast);
    });
});

describe('Director Lobby count', () => {
    it('should return lobby count = 1', () => {
        const mmr: number = 960;
        const player: PlayerAccount = new PlayerAccount({ mmr: mmr });
        const range = Lobby.getMMRRangeWithPlayerAccount(player);
        expect(Director.Instance().lobyCount).to.equal(1);
    });
});

describe('Director removeAllLobbies', () => {
    it('should return lobby count = 0', () => {
        Director.Instance().removeAllLobbies();
        expect(Director.Instance().lobyCount).to.equal(0);
    });
});

describe('Director addClientToLobby', () => {
    it('should return lobby count = 1', () => {
        let playerAccount: PlayerAccount = Database.generateMockPlayerAccount();
        playerAccount.mmr = 400;
        let client: ClientProxy = new ClientProxy(playerAccount.uuid);
        const lobby: Lobby = Director.Instance().addClientToLobby(client);
        lobby.stop();
        expect(Director.Instance().lobyCount).to.equal(1);
        expect(lobby.mmrRange).to.deep.equal({min: 301, max: 600});
    });
});
