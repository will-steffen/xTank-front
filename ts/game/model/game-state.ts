import { PlayerState } from './player-state';
import { Bullet } from './bullet';

export class GameState {
    players: PlayerState[];
    bullets: Bullet[];
}