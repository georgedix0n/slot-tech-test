import * as PIXI from "pixi.js";
import { Base } from "../base.js";

/**
 * Symbol 
 * 
 * @class
 * @extends Base
 */
export class Symbol extends Base {
	/**
     * 
     * @param {number} id - id used for the symbols
     * @param {string} name - name of the symbol asset
     */
	constructor(id, name) {
		super();
		this._create(id, name);
	}

	/**
     * Get the id of the symbol
     * 
     * @member
     * @readonly
     */
	get id() {
		return this._id;
	}

	/**
     * Play the symbol animation
     * 
     * @param {boolean} [loop=false] - loop the animation
     */
	play(loop=false) {        
		this._native.loop = loop;
		this._native.play();
	}
    
	/**
     * Stop the symbol animation
     */
	stop() {
		this._native.stop();
	}

	/**
     * Reset the symbol and remove from parent object
     */
	reset(){
		this._native.parent.removeChild(this._native);       
		this._native.x = 0;
		this._native.y = 0;
	}

	/**
     * create the Symbol using base PIXI objects and loaded animations
     * 
     * @param {number} id - id used for the symbols
     * @param {string} name - name of the symbol asset
     * @private
     */
	_create(id, name) {
		this._id = id;
		this._name = name;
		const animations = PIXI.Assets.cache.get(this._name).data.animations;
		this._native = PIXI.AnimatedSprite.fromFrames(animations[`${this._name}Win`]);
	}
}