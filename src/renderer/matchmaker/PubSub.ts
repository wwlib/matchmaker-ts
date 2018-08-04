import * as PubSubJS from 'pubsub-js';

const uuidv4 = require('uuid/v4');
const now = require("performance-now");

export type PubSubOptions = {
    uuid?: string;
    deltaTime?: number;
    debug?: boolean;
}

export default class PubSub {

    private static _instance: PubSub;

    public on: boolean = false;
    public uuid: string;
    public debug: boolean;
    public performanceStats: any;

    private _unsubscribeQueue: string[];
    private _subscriptionsCount: number;

    private _tickInterval: any;
    private _tickHandler: any = this.tick.bind(this);
    private _deltaTime: number;
    public avgTickTime: number;
    public lastTickTime: number;

    constructor( options?: PubSubOptions) {
        options = options || {};
        let defaultOptions: PubSubOptions =  {
            uuid: uuidv4(),
            deltaTime: 200,
            debug: false
        }
		options = Object.assign(defaultOptions, options);
		this.uuid = options.uuid;
        this._deltaTime = options.deltaTime;
        this.debug = options.debug;
        this.performanceStats = undefined;
        this._unsubscribeQueue = [];
        this._subscriptionsCount = 0;
    }

    static Instance(options?: PubSubOptions)
    {
        return this._instance || (this._instance = new this(options));
    }

    tick(): void {
        let startTime: number = now();
        let l: number = this._unsubscribeQueue.length;
        let batch: number = Math.min(100, l);
        for (var i=0; i<batch; i++) {
            let tokenToUnsubscribe: string = this._unsubscribeQueue.shift();
            if (tokenToUnsubscribe) {
                this._subscriptionsCount--;
                PubSubJS.unsubscribe(tokenToUnsubscribe);
            }
        }
        this.lastTickTime = now() - startTime;
        this.updateAverageTickTime(this.lastTickTime);
    }

    start(): void {
        this._tickInterval = setInterval(this._tickHandler, this._deltaTime);
    }

    stop(): void {
        clearInterval(this._tickInterval);
    }

    getPerformanceStats(): any {
        this.performanceStats = { unsubscribeQueueLength: this._unsubscribeQueue.length, subscriptionsCount: this._subscriptionsCount }
        return this.performanceStats
    }

    updateAverageTickTime(tickTime): void {
		this.avgTickTime += (tickTime - this.avgTickTime) * 0.1;
	}

    subscribe(topic: string, callback: any): string {
        if (this.on) {
            this._subscriptionsCount++;
            return PubSubJS.subscribe(topic, callback);
        } else {
            return '';
        }
    }

    publish(topic: string, data: any): void {
        if (this.on) {
            PubSubJS.publish(topic, data);
        }
    }

    unsubscribe(token: string): void {
        if (this.on) {
            this._unsubscribeQueue.push(token);
        }
    }

    get unsubscribeQueueCount(): number {
        return this._unsubscribeQueue.length;
    }

    get subscriptionsCount(): number {
        return this._subscriptionsCount;
    }

    log(msg: string, obj?: any): void {
        console.log(`PubSub: ${msg}: `, obj);
    }
}
