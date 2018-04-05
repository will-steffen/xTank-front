import { FieldController } from './controllers/field-controller';
import { PlayerController } from './controllers/player-controller';
import { ConnectionController } from './controllers/connection-controller';
import { AssetElement } from './model/base';
import { Config } from './model/config';
import { Assets } from './def/assets';

export class Game {    
    app: PIXI.Application;
    field: FieldController;
    player: PlayerController;
    connection: ConnectionController;
    height: number;
    width: number;
    config: Config;
    text:  PIXI.Text;
    assets: Assets;  

    constructor() { 
        this.assets = new Assets();
        this.loadConfig().then(() => {
            this.app = new PIXI.Application({ width: this.config.width, height: this.config.height });
            this.field = new FieldController(this);
            this.player = new PlayerController(this);
            this.connection = new ConnectionController(this);
            this.height = this.app.view.height;
            this.width = this.app.view.width;
            this.app.view.style.marginTop = 'calc(50vh - ' + (this.config.height/2) + 'px)';
            document.body.appendChild(this.app.view);                 
            this.load();
        });   
    }

    load() {
        let toLoad: AssetElement[] = [
            this.assets.gun, 
            this.assets.tank,
            this.assets.pointer,
            this.assets.bullet
        ];
     
        let paths: string[] = toLoad.map(i => { return i.path });
   
        PIXI.loader
            .add(paths)
            .load(() => this.create());
            // .on('progress', p => { console.log(Math.round(p.progress) + '%')});
    }
  
    create() {
        this.field.create();
        this.player.create();
        this.app.ticker.add(delta => this.update(delta));
        this.addFPS();
    }

    update(delta) {
        this.field.update(delta);
        this.player.update(delta);
    }

    message(txt: string) {
        if(this.text)
            this.text.text = txt;
    }

    private addFPS() {
        let mFps = 60;
        this.text = new PIXI.Text('', {
            fill: 'white',
            fontSize: 30
        });      
        this.app.stage.addChild(this.text);
        // this.app.ticker.add(delta => {
        //     let fp = Math.round(60 / delta);
        //     if(fp < mFps) {
        //         mFps = fp;
        //         setTimeout(() => { mFps = 60 }, 3000);
        //     }
        //     this.text.text = fp + ' - ' + mFps
        // }); 
    }
    
    private loadConfig(): Promise<void> {
        // TS error with "new Promise()" =[
        return new window['Promise']((resolve, reject) => {
            
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = () => {
                if (xmlhttp.readyState == XMLHttpRequest.DONE) { 
                   if (xmlhttp.status == 200) {                     
                       this.config = new Config().fromServer(xmlhttp.responseText);
                       resolve();
                   }             
                   else {
                       reject();
                   }
                }
            };        
            xmlhttp.open("GET", this.assets.configPath, true);
            xmlhttp.send();
        });
    }
}

