(function () {
  var main = null;
  var modules = {
      "require": {
          factory: undefined,
          dependencies: [],
          exports: function (args, callback) { return require(args, callback); },
          resolved: true
      }
  };
  function define(id, dependencies, factory) {
      return main = modules[id] = {
          dependencies: dependencies,
          factory: factory,
          exports: {},
          resolved: false
      };
  }
  function resolve(definition) {
      if (definition.resolved === true)
          return;
      definition.resolved = true;
      var dependencies = definition.dependencies.map(function (id) {
          return (id === "exports")
              ? definition.exports
              : (function () {
                  if(modules[id] !== undefined) {
                    resolve(modules[id]);
                    return modules[id].exports;
                  } else {
                    try {
                      return require(id);
                    } catch(e) {
                      throw Error("module '" + id + "' not found.");
                    }
                  }
              })();
      });
      definition.factory.apply(null, dependencies);
  }
  function collect() {
      Object.keys(modules).map(function (key) { return modules[key]; }).forEach(resolve);
      return (main !== null) 
        ? main.exports
        : undefined
  }

  define("game/model/player-state", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class PlayerState {
          send(serverId, x, y, rotation, gunRotation, dead) {
              this.x = x;
              this.y = y;
              this.rotation = rotation;
              this.gunRotation = gunRotation;
              this.id = serverId;
              this.dead = dead;
              return this;
          }
      }
      exports.PlayerState = PlayerState;
  });
  define("game/model/bullet", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class Bullet {
          send(x, y, angle, playerId) {
              this.x = x;
              this.y = y;
              this.angle = angle;
              this.playerId = playerId;
              return this;
          }
      }
      exports.Bullet = Bullet;
  });
  define("game/model/game-state", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class GameState {
      }
      exports.GameState = GameState;
  });
  define("game/model/hit", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class Hit {
      }
      exports.Hit = Hit;
  });
  define("game/model/tank", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class Tank {
          constructor(game) {
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
      exports.Tank = Tank;
  });
  define("game/controllers/field-controller", ["require", "exports", "game/model/tank"], function (require, exports, tank_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class FieldController {
          constructor(game) {
              this.game = game;
              this.killCount = 0;
              this.bulletsPool = [];
              this.bulletsScreen = [];
              this.tanksPool = [];
              this.tanksScreen = [];
              this.render = true;
          }
          setState(state) {
              this.state = state;
          }
          create() {
              this.game.connection.create();
          }
          update(delta) {
              this.game.connection.sendPlayerState(this.game.player.tank.container.x, this.game.player.tank.container.y, this.game.player.tank.base.rotation, this.game.player.tank.gun.rotation, this.game.player.dead);
              this.resetTanks();
              this.resetBullets();
              if (this.state && this.render) {
                  this.updateTanks();
                  this.updateBullets();
              }
              this.cleanTanks();
              this.cleanBullets();
          }
          updateTanks() {
              this.state.players.forEach(player => {
                  if (player.id != this.game.connection.serverId && !player.dead) {
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
          getBullet() {
              let bullet;
              if (this.bulletsPool.length > 0) {
                  bullet = this.bulletsPool[0];
                  this.bulletsPool.splice(0, 1);
              }
              else {
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
          getTank() {
              let tank;
              if (this.tanksPool.length > 0) {
                  tank = this.tanksPool[0];
                  this.tanksPool.splice(0, 1);
              }
              else {
                  tank = new tank_1.Tank(this.game);
              }
              this.tanksScreen.push(tank);
              return tank;
          }
          hit(hit) {
              if (hit.targetId == this.game.connection.serverId) {
                  this.game.message('YOU DIED');
                  this.game.player.dead = true;
                  this.render = false;
                  this.killCount = 0;
                  setTimeout(() => {
                      this.game.message('');
                      this.game.player.dead = false;
                      this.render = true;
                  }, 3000);
              }
              else if (hit.killerId == this.game.connection.serverId) {
                  this.killCount++;
                  this.game.message('[' + this.killCount + ']');
              }
          }
      }
      exports.FieldController = FieldController;
  });
  define("game/controllers/player-controller", ["require", "exports", "game/model/tank"], function (require, exports, tank_2) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class PlayerController {
          constructor(game) {
              this.game = game;
              this.dead = false;
              this.keysCode = { up: 87, down: 83, left: 65, right: 68 };
              this.keysArrowCode = { up: 38, down: 40, left: 37, right: 39 };
              this.keys = { up: false, down: false, left: false, right: false, mousedown: false };
              this.rotation = {
                  vertical: 0,
                  horizontal: Math.PI / 2,
                  diagonal1: Math.PI / 4,
                  diagonal2: -Math.PI / 4,
              };
              this.shotCooldownCrtl = 0;
              this.diagonalSpeedFactor = 1 / 1.414213;
          }
          create() {
              this.tank = new tank_2.Tank(this.game);
              window.addEventListener('keydown', evt => {
                  switch (evt.keyCode) {
                      case this.keysCode.up:
                          this.keys.up = true;
                          break;
                      case this.keysCode.down:
                          this.keys.down = true;
                          break;
                      case this.keysCode.left:
                          this.keys.left = true;
                          break;
                      case this.keysCode.right:
                          this.keys.right = true;
                          break;
                  }
              });
              window.addEventListener('keyup', evt => {
                  switch (evt.keyCode) {
                      case this.keysCode.up:
                          this.keys.up = false;
                          break;
                      case this.keysCode.down:
                          this.keys.down = false;
                          break;
                      case this.keysCode.left:
                          this.keys.left = false;
                          break;
                      case this.keysCode.right:
                          this.keys.right = false;
                          break;
                  }
              });
              window.addEventListener('mousedown', evt => { this.keys.mousedown = true; });
              window.addEventListener('mouseup', evt => { this.keys.mousedown = false; });
              this.pointer = new PIXI.Sprite(PIXI.loader.resources[this.game.assets.pointer.path].texture);
              this.pointer.x = -10;
              this.pointer.y = -10;
              this.pointer.width = this.game.width / 150;
              this.pointer.height = this.pointer.width;
              this.pointer.anchor.x = 0.5;
              this.pointer.anchor.y = 0.5;
              this.game.app.stage.addChild(this.pointer);
          }
          update(delta) {
              let s = this.game.config.tankSpeed * delta;
              if (this.keys.up && this.tank.container.y > this.tank.container.height / 2) {
                  if (this.keys.left || this.keys.right)
                      s *= this.diagonalSpeedFactor;
                  this.tank.container.y -= s;
              }
              else {
                  this.keys.up = false;
              }
              if (this.keys.down && this.tank.container.y < this.game.height - this.tank.container.height / 2) {
                  if (this.keys.left || this.keys.right)
                      s *= this.diagonalSpeedFactor;
                  this.tank.container.y += s;
              }
              else {
                  this.keys.down = false;
              }
              if (this.keys.left && this.tank.container.x > this.tank.container.width / 2) {
                  this.tank.container.x -= s;
              }
              else {
                  this.keys.left = false;
              }
              if (this.keys.right && this.tank.container.x < this.game.width - this.tank.container.width / 2) {
                  this.tank.container.x += s;
              }
              else {
                  this.keys.right = false;
              }
              if (this.keys.up && this.keys.left || this.keys.down && this.keys.right) {
                  this.tank.base.rotation = this.rotation.diagonal2;
              }
              else if (this.keys.up && this.keys.right || this.keys.down && this.keys.left) {
                  this.tank.base.rotation = this.rotation.diagonal1;
              }
              else if (this.keys.up || this.keys.down) {
                  this.tank.base.rotation = this.rotation.vertical;
              }
              else if (this.keys.left || this.keys.right) {
                  this.tank.base.rotation = this.rotation.horizontal;
              }
              var mouseposition = this.game.app.renderer.plugins.interaction.mouse.global;
              this.pointer.x = mouseposition.x;
              this.pointer.y = mouseposition.y;
              this.gunTrack(mouseposition);
              if (this.keys.mousedown && this.shotCooldownCrtl <= 0 && !this.dead) {
                  this.shotCooldownCrtl = this.game.config.shotCooldown;
                  let distance = this.game.config.tankSize * 1.1 / 2;
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
              let d = dx >= 0 ? 1 : -1;
              this.tank.gun.rotation = Math.atan(dy / dx) + (Math.PI * d / 2);
          }
      }
      exports.PlayerController = PlayerController;
  });
  define("game/model/enums", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var BroadcastType;
      (function (BroadcastType) {
          BroadcastType[BroadcastType["Open"] = 1] = "Open";
          BroadcastType[BroadcastType["Update"] = 2] = "Update";
          BroadcastType[BroadcastType["Bullet"] = 3] = "Bullet";
          BroadcastType[BroadcastType["Hit"] = 4] = "Hit";
      })(BroadcastType = exports.BroadcastType || (exports.BroadcastType = {}));
  });
  define("game/model/ws-receive", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class WsReceive {
          fromServer(data) {
              let s = JSON.parse(data);
              this.type = s.type;
              this.id = s.id;
              this.gameState = s.gameState;
              this.hit = s.hit;
              return this;
          }
      }
      exports.WsReceive = WsReceive;
  });
  define("game/model/ws-send", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class WsSend {
          constructor(type, playerId) {
              this.type = type;
              this.playerId = playerId;
          }
          json() {
              return JSON.stringify(this);
          }
      }
      exports.WsSend = WsSend;
  });
  define("game/controllers/connection-controller", ["require", "exports", "game/model/ws-receive", "game/model/ws-send", "game/model/bullet", "game/model/enums", "game/model/player-state"], function (require, exports, ws_receive_1, ws_send_1, bullet_1, enums_1, player_state_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class ConnectionController {
          constructor(game) {
              this.game = game;
          }
          create() {
              this.ws = new WebSocket('ws://x-tank-server.herokuapp.com/socket');
              this.ws.onopen = ev => { this.onOpen(ev); };
              this.ws.onclose = ev => { this.onClose(ev); };
              this.ws.onmessage = ev => { this.onMessage(ev); };
              this.ws.onerror = ev => { this.onError(ev); };
          }
          close() {
              this.ws.close();
          }
          onOpen(evt) {
              this.game.message('Server Online');
          }
          onClose(evt) {
              this.game.message('Server Offline -> Trying to Reconnect');
              this.game.field.setState(null);
              setTimeout(() => {
                  this.create();
              }, 1000);
          }
          onMessage(evt) {
              let received = new ws_receive_1.WsReceive().fromServer(evt.data);
              if (received.type == enums_1.BroadcastType.Open) {
                  this.serverId = received.id;
              }
              else if (received.type == enums_1.BroadcastType.Update) {
                  this.game.field.setState(received.gameState);
              }
              else if (received.type == enums_1.BroadcastType.Hit) {
                  this.game.field.hit(received.hit);
              }
          }
          onError(evt) {
          }
          sendBullet(x, y, angle) {
              if (this.isConnected()) {
                  let send = new ws_send_1.WsSend(enums_1.BroadcastType.Bullet, this.serverId);
                  send.bullet = new bullet_1.Bullet().send(x, y, angle, this.serverId);
                  this.ws.send(send.json());
              }
          }
          sendPlayerState(x, y, rotation, gunRotation, dead) {
              if (this.isConnected()) {
                  let send = new ws_send_1.WsSend(enums_1.BroadcastType.Update, this.serverId);
                  send.player = new player_state_1.PlayerState().send(this.serverId, x, y, rotation, gunRotation, dead);
                  this.ws.send(send.json());
              }
          }
          isConnected() {
              return this.ws.readyState == WebSocket.OPEN;
          }
      }
      exports.ConnectionController = ConnectionController;
  });
  define("game/model/base", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class AssetElement {
          constructor(path, width, height) {
              this.path = path;
              this.width = width;
              this.height = height;
          }
      }
      exports.AssetElement = AssetElement;
  });
  define("game/model/config", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class Config {
          fromServer(data) {
              let c = JSON.parse(data);
              this.wsPort = c.wsPort;
              this.width = c.width;
              this.height = c.height;
              this.tankSize = c.tankSize;
              this.tankSpeed = c.tankSpeed;
              this.bulletSize = c.bulletSize;
              this.shotCooldown = c.shotCooldown;
              return this;
          }
          local() {
              this.wsPort = 8081;
              this.width = 900;
              this.height = 600;
              this.tankSize = 70;
              this.tankSpeed = 3;
              this.bulletSize = 4;
              this.bulletSize = 30;
              return this;
          }
      }
      exports.Config = Config;
  });
  define("game/def/assets", ["require", "exports", "game/model/base"], function (require, exports, base_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      let folder = 'assets/';
      class Assets {
          constructor() {
              this.gun = new base_1.AssetElement(folder + 'gun.png', 177, 177);
              this.tank = new base_1.AssetElement(folder + 'base.png', 177, 177);
              this.pointer = new base_1.AssetElement(folder + 'pointer.png', 2, 2);
              this.bullet = new base_1.AssetElement(folder + 'bullet.png', 2, 2);
              this.configPath = 'config.json';
          }
      }
      exports.Assets = Assets;
  });
  define("game/game", ["require", "exports", "game/controllers/field-controller", "game/controllers/player-controller", "game/controllers/connection-controller", "game/model/config", "game/def/assets"], function (require, exports, field_controller_1, player_controller_1, connection_controller_1, config_1, assets_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class Game {
          constructor() {
              this.assets = new assets_1.Assets();
              this.loadConfig().then(() => {
                  this.app = new PIXI.Application({ width: this.config.width, height: this.config.height });
                  this.field = new field_controller_1.FieldController(this);
                  this.player = new player_controller_1.PlayerController(this);
                  this.connection = new connection_controller_1.ConnectionController(this);
                  this.height = this.app.view.height;
                  this.width = this.app.view.width;
                  this.app.view.style.marginTop = 'calc(50vh - ' + (this.config.height / 2) + 'px)';
                  document.body.appendChild(this.app.view);
                  this.load();
              });
          }
          load() {
              let toLoad = [
                  this.assets.gun,
                  this.assets.tank,
                  this.assets.pointer,
                  this.assets.bullet
              ];
              let paths = toLoad.map(i => { return i.path; });
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
          message(txt) {
              if (this.text)
                  this.text.text = txt;
          }
          addFPS() {
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
          loadConfig() {
              // TS error with "new Promise()" =[
              return new window['Promise']((resolve, reject) => {
                  var xmlhttp = new XMLHttpRequest();
                  xmlhttp.onreadystatechange = () => {
                      if (xmlhttp.readyState == XMLHttpRequest.DONE) {
                          if (xmlhttp.status == 200) {
                              this.config = new config_1.Config().fromServer(xmlhttp.responseText);
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
      exports.Game = Game;
  });
  define("app", ["require", "exports", "game/game"], function (require, exports, game_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      window['game'] = new game_1.Game();
  });
  
  return collect(); 
})();