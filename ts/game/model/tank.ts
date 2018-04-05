import { Game } from "../game";
import { PlayerState } from "./player-state";

export class Tank {  
    container: PIXI.Container;
    base: PIXI.Sprite;
    gun: PIXI.Sprite;

    constructor(game: Game){
        this.container = new PIXI.Container();
        this.gun = new PIXI.Sprite(PIXI.loader.resources[game.assets.gun.path].texture);
        this.base = new PIXI.Sprite(PIXI.loader.resources[game.assets.tank.path].texture);

        this.container.addChild(this.base);
        this.container.addChild(this.gun);
        this.container.width = game.config.tankSize;
        this.container.height = this.container.width;
        this.container.pivot.y = 0.5;
        this.container.pivot.x = 0.5;
        this.base.anchor.y = 0.5;
        this.base.anchor.x = 0.5;

        this.gun.anchor.x = 0.5;
        this.gun.anchor.y = 0.5;        

        this.container.x = game.width / 2;
        this.container.y = game.height / 2;      

        game.app.stage.addChild(this.container);
    }
}