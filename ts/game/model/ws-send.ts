import { Bullet } from './bullet';
import { BroadcastType } from './enums';
import { PlayerState } from './player-state';

export class WsSend {
    bullet: Bullet;
    player: PlayerState;

    constructor(public type: BroadcastType, public playerId: number){}

    json(): string {
        return JSON.stringify(this);
    }
}