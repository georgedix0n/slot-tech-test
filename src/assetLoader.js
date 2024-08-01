import * as PIXI from "pixi.js";

/**
 * 
 */
class AssetLoader {
	constructor() {
		this._queue =[];
	}

	/**
     * add an asset to the queue of assets to load using PIXI
     * 
     * @param {*} asset - any asset we need to load 
     */
	addToQueue(asset) {
		this._queue.push(asset);
	}

	/**
     * lead all assets added to the queue and reset the to the queue
     * 
     * @async
     */
	async loadQueue() {
		await PIXI.Assets.load(this._queue);
		this._queue.length = 0;
	}
}

export const assetLoader = new AssetLoader();