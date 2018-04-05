export class Bullet {
    x: number;
    y: number;
    angle: number;
    id: number;
    playerId: number;

    send(x: number, y: number, angle: number, playerId: number): Bullet {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.playerId = playerId;
        return this;
    }

}