
import Lobby from '../src/renderer/matchmaker/game/Lobby';
import PlayerAccount, { PlayerLocation } from '../src/renderer/matchmaker/PlayerAccount';
import Database from '../src/renderer/matchmaker/Database';
import ClientProxy from '../src/renderer/matchmaker/ClientProxy';

// import Director from '../src/renderer/matchmaker/Director';
import { expect } from 'chai';
import 'mocha';

describe('Lobby Ranges', () => {
    it('should have a valid first element: {min: 0, max: 300}', () => {
        const range = Lobby.MMRRanges[0];
        expect(range).to.deep.equal({ min: 0, max: 300 });
    });
});

describe('Lobby.inRange', () => {
    it('should return true for 100 in range: {min: 0, max: 300}', () => {
        const range = Lobby.MMRRanges[0];
        expect(Lobby.inRange(100, range)).to.be.true;
    });
});

describe('Lobby.getMMRRangeWithPlayerAccount', () => {
    it('should return a range given a PlayerAccount: {min: 601, max: 1000}', () => {
        const mmr: number = 960;
        const player: PlayerAccount = new PlayerAccount({ mmr: mmr });
        const range = Lobby.getMMRRangeWithPlayerAccount(player);
        expect(range).to.deep.equal({ min: 601, max: 1000 });
    });
});

describe('Lobby.willAcceptPlayer', () => {
    it('should return true for specified player and lobby', () => {
        const lobby: Lobby = new Lobby({
            location: PlayerLocation.NorthAmericaEast,
            mmrRange: {min: 1001, max: 1800},
            maxClients: 20,
        });
        lobby.stop();
        const mmr: number = 1450;
        const player: PlayerAccount = new PlayerAccount({ location: PlayerLocation.NorthAmericaEast, mmr: mmr });
        expect(lobby.willAcceptPlayer(player)).to.be.true;
    });
});

// match players with close mmr scores - diff < 100
// dont match player with not-close mmr score & short wait times
// match players with not-close mmr score & LONG wait times

describe('Lobby will match close mmrs', () => {
    it('should return true for mmr diff < 100', () => {
        const lobby: Lobby = new Lobby({
            location: PlayerLocation.NorthAmericaEast,
            mmrRange: {min: 1001, max: 1800},
            maxClients: 20,
        });
        lobby.stop();
        const player1: PlayerAccount = Database.generateMockPlayerAccount({ location: PlayerLocation.NorthAmericaEast, mmr: 1200 });
        const player2: PlayerAccount = Database.generateMockPlayerAccount({ location: PlayerLocation.NorthAmericaEast, mmr: 1150 });
        const client1: ClientProxy = new ClientProxy(player1.uuid);
        const client2: ClientProxy = new ClientProxy(player2.uuid);
        expect(lobby.willMatchClients(client1, client2)).to.be.true;
    });
});

describe('Lobby will not match not-close mmrs', () => {
    it('should return false for mmr diff > 100', () => {
        const lobby: Lobby = new Lobby({
            location: PlayerLocation.NorthAmericaEast,
            mmrRange: {min: 1001, max: 1800},
            maxClients: 20,
        });
        lobby.stop();
        const player1: PlayerAccount = Database.generateMockPlayerAccount({ location: PlayerLocation.NorthAmericaEast, mmr: 1200 });
        const player2: PlayerAccount = Database.generateMockPlayerAccount({ location: PlayerLocation.NorthAmericaEast, mmr: 1050 });
        const client1: ClientProxy = new ClientProxy(player1.uuid);
        const client2: ClientProxy = new ClientProxy(player2.uuid);
        const mmrDiff: number = Math.abs(client1.playerAccount.mmr - client2.playerAccount.mmr);
        const combinedWaitTime: number = client1.gameTime + client2.gameTime;
        expect(mmrDiff).to.be.greaterThan(100);
        expect(combinedWaitTime).to.be.lessThan(10000);
        expect(lobby.willMatchClients(client1, client2)).to.be.false;
    });
});

describe('Lobby will match not-close mmrs with long wait times', () => {
    it('should return true for mmr diff > 100 and combines wait time > 60000', () => {
        const lobby: Lobby = new Lobby({
            location: PlayerLocation.NorthAmericaEast,
            mmrRange: {min: 1001, max: 1800},
            maxClients: 20,
        });
        lobby.stop();
        const player1: PlayerAccount = Database.generateMockPlayerAccount({ location: PlayerLocation.NorthAmericaEast, mmr: 1200 });
        const player2: PlayerAccount = Database.generateMockPlayerAccount({ location: PlayerLocation.NorthAmericaEast, mmr: 1050 });
        const client1: ClientProxy = new ClientProxy(player1.uuid);
        const client2: ClientProxy = new ClientProxy(player2.uuid);
        const mmrDiff: number = Math.abs(client1.playerAccount.mmr - client2.playerAccount.mmr);
        expect(mmrDiff).to.be.greaterThan(100);
        client1.startGameTimeOffset = 60000;
        client2.startGameTimeOffset = 60000;
        const combinedWaitTime: number = client1.gameTime + client2.gameTime;
        expect(combinedWaitTime).to.be.greaterThan(10000);
        expect(lobby.willMatchClients(client1, client2)).to.be.true;
    });
});

describe('Lobby tick()', () => {
    it('should tick() matchCount should == 0', () => {
        const lobby: Lobby = new Lobby({
            location: PlayerLocation.NorthAmericaEast,
            mmrRange: {min: 1001, max: 1800},
            maxClients: 20,
        });
        lobby.stop();
        const player1: PlayerAccount = Database.generateMockPlayerAccount({ location: PlayerLocation.NorthAmericaEast, mmr: 1200 });
        const player2: PlayerAccount = Database.generateMockPlayerAccount({ location: PlayerLocation.NorthAmericaEast, mmr: 1050 });
        const client1: ClientProxy = new ClientProxy(player1.uuid);
        const client2: ClientProxy = new ClientProxy(player2.uuid);
        lobby.addClient(client1);
        lobby.addClient(client2);
        expect(lobby.clientCount).to.equal(2);
        const mmrDiff: number = Math.abs(client1.playerAccount.mmr - client2.playerAccount.mmr);
        expect(mmrDiff).to.be.greaterThan(100);
        // client1.startGameTimeOffset = 60000;
        // client2.startGameTimeOffset = 60000;
        const combinedWaitTime: number = client1.gameTime + client2.gameTime;
        expect(combinedWaitTime).to.be.lessThan(10000);
        expect(lobby.tick()).to.equal(0);
    });
});

describe('Lobby tick()', () => {
    it('should tick() matchCount should == 1', () => {
        const lobby: Lobby = new Lobby({
            location: PlayerLocation.NorthAmericaEast,
            mmrRange: {min: 1001, max: 1800},
            maxClients: 20,
        });
        lobby.stop();
        const player1: PlayerAccount = Database.generateMockPlayerAccount({ location: PlayerLocation.NorthAmericaEast, mmr: 1200 });
        const player2: PlayerAccount = Database.generateMockPlayerAccount({ location: PlayerLocation.NorthAmericaEast, mmr: 1050 });
        const client1: ClientProxy = new ClientProxy(player1.uuid);
        const client2: ClientProxy = new ClientProxy(player2.uuid);
        lobby.addClient(client1);
        lobby.addClient(client2);
        expect(lobby.clientCount).to.equal(2);
        const mmrDiff: number = Math.abs(client1.playerAccount.mmr - client2.playerAccount.mmr);
        expect(mmrDiff).to.be.greaterThan(100);
        client1.startGameTimeOffset = 60000;
        client2.startGameTimeOffset = 60000;
        const combinedWaitTime: number = client1.gameTime + client2.gameTime;
        expect(combinedWaitTime).to.be.greaterThan(10000);
        expect(lobby.tick()).to.equal(1);
    });
});
