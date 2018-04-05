import { BroadcastType } from './enums';
import { GameState } from './game-state';
import { Hit } from './hit';

export class WsReceive {
    type: BroadcastType;
    id: number;
    gameState: GameState;
    hit: Hit;

    fromServer(data): WsReceive {
        let s = JSON.parse(data);
        this.type = s.type;
        this.id = s.id;
        this.gameState = s.gameState;   
        this.hit = s.hit;   
        return this;
    }
}