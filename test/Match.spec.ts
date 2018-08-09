
import Lobby from '../src/renderer/matchmaker/game/Lobby';
import PlayerAccount, { PlayerLocation } from '../src/renderer/matchmaker/PlayerAccount';
import Database from '../src/renderer/matchmaker/Database';
import ClientProxy from '../src/renderer/matchmaker/ClientProxy';

// import Director from '../src/renderer/matchmaker/Director';
import { expect } from 'chai';
import 'mocha';
const now = require("performance-now");

// var arr = [];
// for (var i = 0; i < 50; i++) {
//     arr[i] = Math.floor(Math.random() * 10000);
// }

var clients: Map<string, number> = new Map<string, number>();
for (var i = 0; i < 50; i++) {
    clients.set(`${i}`, Math.floor(Math.random() * 10000));
}
var arr = Array.from(clients);
let client1: any;
let client2: any;

describe('Match', () => {
    it('find matches', () => {
        var comparisons = 0;
        var matches = 0;
        var startTime = now();
        for (var i = 0, l = arr.length; i < l; i++) {
            for (var j = 0; j < l; j++) {
                comparisons++;
                client1 = arr[i];
                client2 = arr[j]
                if ((client1[0] != client2[0]) && Math.abs(client1[1] - client2[1]) < 100) {
                    matches++;
                }
            }
        }
        var endTime = now();
        console.log('time: ' + (now() - startTime));
        console.log(comparisons);
        console.log(matches);
        expect(comparisons).to.be.greaterThan(50);
    });
});

describe('Match Map', () => {
    it('find matches', () => {
        var comparisons = 0;
        var matches = 0;
        var startTime = now();
        let iterator1: IterableIterator<[string, number]> = clients.entries();
        let iterator2: IterableIterator<[string, number]>; // = clients.entries();
        // console.log(iterator1);
        // console.log(iterator2);
        // console.log(iterator1 == iterator2);
        var matched: Map<number, number> = new Map<number, number>();
        while( client1 = iterator1.next().value ) {
            iterator2 = clients.entries();
            while (client2 = iterator2.next().value ) {
                comparisons++;
                if ((client1[0] != client2[0]) && Math.abs(client1[1] - client2[1]) < 100) {
                    matches++;
                    clients.delete(client1[0]);
                    clients.delete(client2[0]);
                    matched.set(client1[0], client2[0]);
                    break;
                }
            }
        }
        var endTime = now();
        console.log('time: ' + (now() - startTime));
        // console.log(matched);
        console.log(comparisons);
        console.log(matches);

        expect(comparisons).to.be.greaterThan(50);
    });
});

describe('Match Reverse Splice', () => {
    it('find matches', () => {
        var comparisons = 0;
        var matches = 0;
        var startTime = now();
        var arr1 = arr.slice(0);
        var l = arr1.length;
        // var i = l;
        // var j = i;
        // while (i--) {
        //     while (j--) {
        //         comparisons++;
        //         // if (Math.abs(arr[i] - arr[j]) < 100) {
        //         //     matches++;
        //         // }
        //     }
        // }
        var matched: Map<number, number> = new Map<number, number>();
        for (var i = l - 1; i >= 0; i--) {
            let arr2 = arr1.slice(0);
            for (var j = l - 1; j >= 0; j--) {
                comparisons++;
                client1 = arr1[i];
                client2 = arr2[j];
                if ((client1[0] != client2[0]) && Math.abs(client1[1] - client2[1]) < 100) {
                    matches++;
                    matched.set(client1[0],client2[0]);
                    arr1.splice(i, 1);
                    l--;
                    // arr1.splice(j, 1);

                }
            }
        }
        var endTime = now();
        console.log('time: ' + (now() - startTime));
        // console.log(matched);
        console.log(comparisons);
        console.log(matches);

        expect(comparisons).to.be.greaterThan(50);
    });
});
