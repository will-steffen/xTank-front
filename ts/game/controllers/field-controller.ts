import { Game } from '../game';
import { GameState } from '../model/game-state';
import { Hit } from '../model/hit';
import { Tank } from '../model/tank';

export class FieldController {    
    killCount = 0;

    bulletsPool: PIXI.Sprite[] = [];
    bulletsScreen: PIXI.Sprite[] = [];
    tanksPool: Tank[] = [];
    tanksScreen: Tank[] = [];
    state: GameState;
    render: boolean = true;

    constructor(public game: Game) { }

    setState(state: GameState) {
        this.state = state;
    }

    create() {
        this.game.connection.create();
    }

    update(delta: number) {
        this.game.connection.sendPlayerState(
            this.game.player.tank.container.x,
            this.game.player.tank.container.y,
            this.game.player.tank.base.rotation,
            this.game.player.tank.gun.rotation,
            this.game.player.dead
        );
        this.resetTanks();
        this.resetBullets();
        if(this.state && this.render){
            this.updateTanks();
            this.updateBullets();
        }
        this.cleanTanks();
        this.cleanBullets();
    }

    updateTanks() {
        this.state.players.forEach(player => {
            if(player.id != this.game.connection.serverId && !player.dead){
                let tank = this.getTank();
                tank.container.x = player.x;
                tank.container.y = player.y;
                tank.base.rotation = player.rotation;
                tank.gun.rotation = player.gunRotation;
            }
        });        
    }

    updateBullets() {        
        this.state.bullets.forEach(bullet => {
            let b = this.getBullet();
            b.x = bullet.x;
            b.y = bullet.y;         
        });        
    }

    resetBullets() {
        this.bulletsPool = this.bulletsScreen;
        this.bulletsScreen = [];
    }

    cleanBullets() {
        this.bulletsPool.forEach(b => {
            b.x = -100;
            b.y = -100;
        });
    }

    getBullet(): PIXI.Sprite {
        let bullet: PIXI.Sprite;
        if(this.bulletsPool.length > 0){
            bullet = this.bulletsPool[0];
            this.bulletsPool.splice(0, 1);
        }else{
            bullet = new PIXI.Sprite(PIXI.loader.resources[this.game.assets.bullet.path].texture);
            bullet.width = this.game.config.bulletSize;
            bullet.height = this.game.config.bulletSize;
            bullet.anchor.x = 0.5;
            bullet.anchor.y = 0.5;
            bullet.x = -100;
            bullet.y = -100;
            this.game.app.stage.addChild(bullet);
        }
        this.bulletsScreen.push(bullet);
        return bullet;
    }

    resetTanks() {
        this.tanksPool = this.tanksScreen;
        this.tanksScreen = [];
    }

    cleanTanks() {
        this.tanksPool.forEach(t => {
            t.container.x = -100;
            t.container.y = -100;
        });
    }

    getTank(): Tank {
        let tank: Tank;
        if(this.tanksPool.length > 0){
            tank = this.tanksPool[0];
            this.tanksPool.splice(0, 1);
        }else{
            tank = new Tank(this.game);
        }
        this.tanksScreen.push(tank);
        return tank;
    }

    hit(hit: Hit) {
        if(hit.targetId == this.game.connection.serverId){            
            this.game.message('YOU DIED');
            this.game.player.dead = true;  
            this.render = false;
            this.killCount = 0;
            setTimeout(() => {
                this.game.message('');
                this.game.player.dead = false;
                this.render = true;
            },3000);            
        }else if(hit.killerId == this.game.connection.serverId){
            this.killCount++;
            this.game.message('['+this.killCount+']');     
        }
    }
}
