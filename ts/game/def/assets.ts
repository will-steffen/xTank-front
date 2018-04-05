import { AssetElement } from '../model/base'

let folder = 'assets/';

export class Assets {
    gun = new AssetElement(folder + 'gun.png', 177, 177);
    tank = new AssetElement(folder + 'base.png', 177, 177);
    pointer = new AssetElement(folder + 'pointer.png', 2, 2);
    bullet = new AssetElement(folder + 'bullet.png', 2, 2);
    configPath = 'config.json';
}