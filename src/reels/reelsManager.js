import * as PIXI from "pixi.js";
import { Reel } from "./reel.js";
import { Base } from "../base.js";
import { timerManager } from "../utils/timermanager.js";

/**
 * Reel manager controls multipler reels 
 * 
 * @class
 */
export class ReelManager extends Base {
	/**
     * 
     * @param {number} numberOfReels - number of reel instanses to create
     * @param {number} symbolsPerReel - number of reels in view for each reel created
     * @param {number} reelWidth - width of each reel to position created reels correctly
     * @param {number} symbolHeight - height of each symbol
     */
	constructor(numberOfReels, symbolsPerReel, reelWidth, symbolHeight) {
		super();
		this._numberOfReels = numberOfReels;
		this._symbolsPerReel = symbolsPerReel;
		this._reelWidth = reelWidth;
		this._symbolHeight = symbolHeight;
		this._reels = [];
		this._create();
	}

	/**
     * Start the reels spinning called when button is clicked
     */
	startSpin() {
		if (this._spinning) {
			return;
		}
		this._spinning = true;
		this._reels.forEach(reel => {
			reel.startSpin();
		});
       
	}

	/**
     * Stop the reels spinning
     * 
     * @async
     */
	async stopSpin() {
		if (!this._spinning) {
			return;
		}
		this._promises = [];
		this._promises.push(this._reels[0].stopSpin());
		await timerManager.startTimer(250);
		this._promises.push(this._reels[1].stopSpin());
		await timerManager.startTimer(250);
		this._promises.push(this._reels[2].stopSpin());
        
		await Promise.all(this._promises);
        
		this._spinning = false;
	}

	/**
     * Create the reelManager using PIXI container and required reel instances
     * 
     * @private
     */
	_create() {
		this._native = new PIXI.Container("reelManager");
		this._native.x = 314;
		this._native.y = 80;
		this._createMask();
		this._createReels();
	}

	/**
     * create reel mask to hide padding (out of view) symbols
     * 
     * @private
     */
	_createMask() {
		this._mask = PIXI.Sprite.from("mask");
		this._mask.y = 23;
		this._mask.scale.x = 2.3;
		this._mask.scale.y = 2.7;
		this._native.addChild(this._mask);
		this._native.mask = this._mask;
	}

	/**
     * Create reels
     * 
     * @private
     */
	_createReels() {
		for(let i = 0; i < this._numberOfReels; i++ ) {
			const reel = new Reel(this._symbolsPerReel, this._symbolHeight);
			reel.x = i * this._reelWidth;
			this._native.addChild(reel.native);
			this._reels.push(reel);
		}
	}
}