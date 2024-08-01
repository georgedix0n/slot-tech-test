
import { TweenMax } from "gsap";
import { Power0, Power1, Power2, Power3, Power4, Back, Bounce, Elastic, Circ, Expo, Sine, SlowMo, SteppedEase, RoughEase } from "gsap";

export const Easings = Object.freeze({
	Linear: Power0,
	Quad: Power1,
	Cubic: Power2,
	Quart: Power3,
	Quint: Power4,
	Back: Back,
	Bounce: Bounce,
	Elastic: Elastic,
	Circ: Circ,
	Expo: Expo,
	Sine: Sine,
	SlowMo: SlowMo,
	Stepped: SteppedEase,
	Rough: RoughEase
});


export class Tween {
	/**
     * Tween something to an end point
     *
     * @static
     * @param {*} target - The thing we're tweening
     * @param {number} duration - Time (in milliseconds) it takes to complete the tween
     * @param {TweenMax.TweenConfig} [vars={}] - Additional tween settings
     * @returns {TweenMax}
     */
	static to(target, duration, vars = {}) {
		const tween = TweenMax.to(target, duration / 1000, vars);
		tween.startPromise = async() => {
			tween.invalidate();
			await new Promise(resolve => {
				tween.vars.onComplete = () => {
					resolve();
				};
				tween.restart(true);
			});
		};
		return tween;
	}

	/**
     * Tween something from a point to another
     *
     * @static
     * @param {*} target - The thing we're tweening
     * @param {number} duration - Time (in milliseconds) it takes to complete the tween
     * @param {TweenMax.TweenConfig} [fromVars={}] - Additional tween settings
     * @param {TweenMax.TweenConfig} [toVars={}] - Additional tween settings
     * @returns {TweenMax}
     */
	static fromTo(target, duration, fromVars = {}, toVars = {}) {
		const tween = TweenMax.fromTo(target, duration / 1000, fromVars, toVars);
		tween.startPromise = async() => {
			tween.invalidate();
			await new Promise(resolve => {
				tween.vars.onComplete = () => {
					resolve();
				};
				tween.restart(true);
			});
		};
		return tween;
	}
}