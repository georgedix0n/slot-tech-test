/**
 * Base class to add sin=mple getters and setters for classes that create PIXI object as this._native
 * 
 * @class
 */
export class Base {
	/**
     * 
     */
	constructor() {
        
	}    

	/**
     * set the x parameter on the natiove pixi object
     * @member
     */
	get x() {
		return this._native.x;
	}
	set x(x) {
		this._native.x = x;
	}
    
	/**
     * set the y parameter on the natiove pixi object
     * @member
     */
	get y() {
		return this._native.y;
	}
	set y(y) {
		this._native.y = y;
	}

	/**
     * get the base pixi object
     * @member
     * @readonly
     */
	get native() {
		return this._native;
	}
}