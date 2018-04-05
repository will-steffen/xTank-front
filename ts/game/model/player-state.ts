export class PlayerState {
  id: number;
  x: number;
  y: number;
  rotation: number;
  gunRotation: number;
  dead: boolean;

  send(serverId, x, y, rotation, gunRotation, dead): PlayerState {
    this.x = x;
    this.y = y;
    this.rotation = rotation;
    this.gunRotation = gunRotation;
    this.id = serverId;
    this.dead = dead;
    return this;
  }
}