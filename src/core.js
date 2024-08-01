import { renderer } from "./renderer.js";
import { assetLoader } from "./assetLoader.js";
import * as PIXI from "pixi.js";
import { symbolStore } from "./reels/symbolStore.js";
import { ReelManager } from "./reels/reelsManager.js";
import { timerManager } from "./utils/timermanager.js";
import { Button } from "./button.js";

/**
 * Base entry point for the game
 * 
 * @class
 */
class Core {
	constructor() {        
		this._create();
	}

	/**
     * load all assets required for the game
     * 
     * @async
     */
	async loadAssets() {
		assetLoader.addToQueue({ alias: "background", src: "./resource/@2x/gameBG_opt.png"});
		assetLoader.addToQueue({ alias: "cloud1", src: "./resource/@2x/cloud1_opt.png"});
		assetLoader.addToQueue({ alias: "cloud2", src: "./resource/@2x/cloud2_opt.png"});
		assetLoader.addToQueue({ alias: "mask", src: "./resource/@2x/mask_opt.jpg"});
		assetLoader.addToQueue({ alias: "reelSquare", src: "./resource/@2x/reelSquare.png"});
		assetLoader.addToQueue({ src: "./resource/@2x/controlPanel0_opt.json"});
		assetLoader.addToQueue({ alias: "ace", src: "./resource/@2x/symbols/aceWin0_opt.json"});
		assetLoader.addToQueue({ alias: "h2", src: "./resource/@2x/symbols/h2Win0_opt.json"});
		assetLoader.addToQueue({ alias: "h3", src: "./resource/@2x/symbols/h3Win0_opt.json"});
		assetLoader.addToQueue({ alias: "h4", src: "./resource/@2x/symbols/h4Win0_opt.json"});
		assetLoader.addToQueue({ alias: "jack", src: "./resource/@2x/symbols/jackWin0_opt.json"});
		assetLoader.addToQueue({ alias: "king", src: "./resource/@2x/symbols/kingWin0_opt.json"});
		assetLoader.addToQueue({ alias: "nine", src: "./resource/@2x/symbols/nineWin0_opt.json"});
		assetLoader.addToQueue({ alias: "queen", src: "./resource/@2x/symbols/queenWin0_opt.json"});
		assetLoader.addToQueue({ alias: "ten", src: "./resource/@2x/symbols/tenWin0_opt.json"});
		await assetLoader.loadQueue();
	}

	/**
     * Create the renderer instance and initialise everything ready to play the game
     * 
     * @async
     * @private
     */
	async _create() {
		renderer.initialise({
			antialias: false,
			backgroundAlpha: 1,
			backgroundColour: "#000000",
			gameContainerDiv: document.getElementById("gameContainer"),
			width: 1024,
			height: 576
		});
		renderer.start();
		timerManager.init();
		await this.loadAssets();
		this._createObjects(); 
	}

	/**
     * Create all game objecs ready to use
     * 
     * @async
     * @private
     */
	async _createObjects() {

		const graphics = new PIXI.Graphics();
		graphics.beginFill(0x1099bb);
		graphics.drawRect(0, 0, 1024, 300);
		graphics.endFill();
		renderer.addChild(graphics);

		const background = PIXI.Sprite.from("background");
		renderer.addChild(background);

		symbolStore.createSymbols([
			{id: 0, name: "h2"},
			{id: 1, name: "h3"},
			{id: 2, name: "h4"},
			{id: 3, name: "ace"},
			{id: 4, name: "king"},
			{id: 5, name: "queen"},
			{id: 6, name: "jack"},
			{id: 7, name: "ten"},
			{id: 8, name: "nine"}
		],
		3,
		3);

		const container = new PIXI.Container("reelSquares");
		container.x = 324;
		container.y = 95;
		renderer.addChild(container);
		const width = 125;
		const height = 105;
		for (let i = 0; i < 3; i++) {
			for( let j = 0; j < 3; j++) {
				const symbolBack = PIXI.Sprite.from("reelSquare");
				container.addChild(symbolBack);
				symbolBack.x = i * width;
				symbolBack.y = j * height;
			}
		}

		this._reelManager = new ReelManager(3, 3, 125, 105);
		renderer.addChild(this._reelManager.native);

		const button = new Button("playActive", async() => {
			this._reelManager.startSpin();            
			await timerManager.startTimer(2000);
			this._reelManager.stopSpin();    
		});
		button.x = 475;
		button.y = 440;
		renderer.addChild(button.native);

	}
}

window.startup = () => {
	const game = new Core();
};