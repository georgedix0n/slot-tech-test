/**
 * simple timer class 
 * 
 * @class
 */
export class Timer {
	/**
     * 
     * @param {number} delay - number of millisectonds to wait before completing
     * @param {function} callback - call back function to call when timer is finished
     */
	constructor(delay, callback) {
		this._delay = delay;
		this._count = 0;
		this._callback = callback;

	}

	/**
     * update called each frame
     * 
     * @param {number} delta - number of milliseconds since last update
     * @returns {boolean}
     */
	update(delta) {
		this._count += delta;
		if(this._count >= this._delay) {
			this._callback();
			return true;
		}
		else {
			return false;
		}
	}
}