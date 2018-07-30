
import Lobby from '../src/renderer/matchmaker/game/Lobby';
import PlayerAccount, { PlayerLocation } from '../src/renderer/matchmaker/PlayerAccount';

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
        const mmr: number = 1450;
        const player: PlayerAccount = new PlayerAccount({ location: PlayerLocation.NorthAmericaEast, mmr: mmr });
        expect(lobby.willAcceptPlayer(player)).to.be.true;
    });
});
