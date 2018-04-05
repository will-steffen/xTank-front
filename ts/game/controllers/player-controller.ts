import { Game } from '../game';
import { Tank } from '../model/tank';

export class PlayerController { 
    tank: Tank;  
    dead: boolean = false;
    keysCode = { up: 87, down: 83, left: 65, right: 68 };
    keysArrowCode = { up: 38, down: 40, left: 37, right: 39 };
    keys = { up: false, down: false, left: false, right: false, mousedown: false };
    rotation = {
        vertical: 0,
        horizontal: Math.PI / 2,
        diagonal1: Math.PI / 4,
        diagonal2: - Math.PI / 4,
    };
    pointer: PIXI.Sprite;   
    shotCooldownCrtl = 0;
    diagonalSpeedFactor = 1 / 1.414213;

    constructor(public game: Game) { }

    create() {
        this.tank = new Tank(this.game);

        window.addEventListener('keydown', evt => {
            switch(evt.keyCode){
                case this.keysCode.up:    this.keys.up    = true;break;
                case this.keysCode.down:  this.keys.down  = true; break;
                case this.keysCode.left:  this.keys.left  = true; break;
                case this.keysCode.right: this.keys.right = true; break;
            }
        });
        window.addEventListener('keyup', evt => {
            switch(evt.keyCode){
                case this.keysCode.up:    this.keys.up    = false; break;
                case this.keysCode.down:  this.keys.down  = false; break;
                case this.keysCode.left:  this.keys.left  = false; break;
                case this.keysCode.right: this.keys.right = false; break;
            }
        });
        window.addEventListener('mousedown', evt => { this.keys.mousedown = true });
        window.addEventListener('mouseup', evt => { this.keys.mousedown = false });
        this.pointer = new PIXI.Sprite(PIXI.loader.resources[this.game.assets.pointer.path].texture);
        this.pointer.x = -10;
        this.pointer.y = -10;

        this.pointer.width = this.game.width / 150;
        this.pointer.height = this.pointer.width;

        this.pointer.anchor.x = 0.5;
        this.pointer.anchor.y = 0.5;

        this.game.app.stage.addChild(this.pointer);        
    }    

    update(delta: number) {
        let s = this.game.config.tankSpeed * delta;
        if(this.keys.up && this.tank.container.y > this.tank.container.height/2){            
            if(this.keys.left || this.keys.right) s *= this.diagonalSpeedFactor;
            this.tank.container.y -= s;
        }else{
            this.keys.up = false;
        }
        if(this.keys.down && this.tank.container.y < this.game.height - this.tank.container.height/2){
            if(this.keys.left || this.keys.right) s *= this.diagonalSpeedFactor;
            this.tank.container.y += s;
        }else{
            this.keys.down = false;
        }
        if(this.keys.left && this.tank.container.x > this.tank.container.width/2){
            this.tank.container.x -= s;
        }else{
            this.keys.left = false;
        }
        if(this.keys.right && this.tank.container.x < this.game.width - this.tank.container.width/2){
            this.tank.container.x += s;
        }else{
            this.keys.right = false;
        }

        if(this.keys.up && this.keys.left || this.keys.down && this.keys.right){
            this.tank.base.rotation = this.rotation.diagonal2;
        }else if(this.keys.up && this.keys.right || this.keys.down && this.keys.left){
            this.tank.base.rotation = this.rotation.diagonal1;
        }else if(this.keys.up || this.keys.down){
            this.tank.base.rotation = this.rotation.vertical;
        }else if(this.keys.left || this.keys.right){
            this.tank.base.rotation = this.rotation.horizontal;
        }

        var mouseposition = this.game.app.renderer.plugins.interaction.mouse.global;
        this.pointer.x = mouseposition.x;
        this.pointer.y = mouseposition.y;
        this.gunTrack(mouseposition);
        if(this.keys.mousedown && this.shotCooldownCrtl <= 0 && !this.dead){
            this.shotCooldownCrtl = this.game.config.shotCooldown;
            let distance = this.game.config.tankSize * 1.1 / 2
            let rot = this.tank.gun.rotation;
            let x = this.tank.container.x + Math.sin(rot) * distance;
            let y = this.tank.container.y - Math.cos(rot) * distance;           
            this.game.connection.sendBullet(x, y, rot);
        }
        this.shotCooldownCrtl -= delta;
    }

    gunTrack(pos) {
        let dx = pos.x - this.tank.container.x;
        let dy = pos.y - this.tank.container.y;
        let d =  dx >= 0 ? 1 : -1;  
        this.tank.gun.rotation = Math.atan(dy/dx) + (Math.PI * d / 2);      
    }
    
}