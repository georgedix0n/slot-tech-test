import * as PIXI from "pixi.js";
import { symbolStore } from "./symbolStore.js";
import { Base } from "../base.js";
import { Easings, Tween } from "../utils/tween.js";
import { renderer } from "../renderer.js";

/**
 * Base reel class to handle a single reel spinning random symbols throuhg a reel apature
 * @class
 */
export class Reel extends Base {
	/**
     * 
     * @param {number} numberOfSymbols - number of symbols in view on the reel
     * @param {number} symbolHeight - height of each symbol
     */
	constructor(numberOfSymbols, symbolHeight) {
		super();
		this._symbolsInView = numberOfSymbols;
		this._symbolHeight = symbolHeight;
		this._symbols = [];
		this._spinning = false;
		this._spinningSpeed = 0;
		this._create();
	}

	/**
     * Start the reels spinning
     * 
     * @async
     */
	async startSpin() {
		if(this._spinning) {
			return;
		}
		this._spinning = true;
		this._createNextSymbol();
        
		Tween.fromTo(this, 1000, {_spinningSpeed: 0, ease: Easings.Back.easeIn}, {_spinningSpeed: 10}).startPromise();

	}

	/**
     * Start stopping the reel from spinning
     * 
     * @async
     */
	async stopSpin() {
		this._stopping = true;        
		return new Promise(resolve => {
			this._resolve = resolve;
		});
	}

	/**
     * Tween reels to the final position and respone promise from stopSpin()
     * 
     * @async
     */
	async stop() {
		await Tween.fromTo(this._native, 750, {y: 0, ease: Easings.Back.easeOut}, {y: this._symbolHeight}).startPromise();
		this._native.y = 0;
		const symbol = this._symbols.pop();
		symbolStore.returnSymbol(symbol);
		this._repositionSymbols();
		this._resolve();
	}

	/**
     * reset all symbols to the correct positions
     */
	_repositionSymbols() {
		const paddingTop = this._symbols.length === this._symbolsInView + 2 ? 1 : 2;
		this._symbols.forEach((symbol, index) => symbol.y = (this._symbolHeight*index) - (this._symbolHeight*paddingTop));
	}

	/**
     * Create the reel using PIXI container and initial symbols
     * 
     * @private
     */
	_create() {
		this._native = new PIXI.Container("reel");
		const totalHeight = this._symbolHeight * (this._symbolsInView);
		for (let i = 0; i < this._symbolsInView + 2; i++) { // adding symbol before and after to hide creation and removal of symbols
			const symbol = symbolStore.getRandomSymbol();
			symbol.y = totalHeight - (i * this._symbolHeight);
			this._native.addChild(symbol.native);
			this._symbols.unshift(symbol);
		}
		renderer.app.ticker.add(() => {
			this._update(renderer.app.ticker.elapsedMS);
		});
	}

	/**
     * create the next symbol to spin through te appature either random or a specific id
     * 
     * @param {number} [symbolId=null] - Symbol id to generate
     * @private
     */
	_createNextSymbol(symbolId=null) {
		const symbol = symbolId === null ? symbolStore.getRandomSymbol() : symbolStore.getSymbol(symbolId);
		symbol.y = this._symbols[0].native.y-this._symbolHeight;
		this._native.addChild(symbol.native);
		this._symbols.unshift(symbol);
	}

	/**
     * Update called each frame
     * 
     * @async
     * @private 
     */
	async _update() {
		if(!this._spinning) {
			return;
		}
		this._symbols.forEach(symbol => {
			symbol.native.y += this._spinningSpeed;
		});

		if (this._symbols[0].native.y >= -this._symbolHeight ) {
			this._createNextSymbol();
			const symbol = this._symbols.pop();
			symbolStore.returnSymbol(symbol);
			if (this._stopping) {
				this._stopping = false;
				this._spinning = false;
				this._repositionSymbols();             
				this.stop();
			}
		}
	}

	/**
     * Returns active symbol Ids to be used for gameplay
     *
     * @async
     */
	async getActiveSymbolIds() {
		const activeSymbols = this._symbols.slice(1, -1); // slice to remove the symbols that were added to hide creation and removal of symbols (first and last)
		return activeSymbols.map(symbol => symbol.id);
	}

}