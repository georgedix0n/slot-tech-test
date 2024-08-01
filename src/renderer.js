
import * as PIXI from "pixi.js";
import { TweenMax } from "gsap";

/**
 * Renderer creates instance of PIXI Application and sets up events.
 * Also handles requestAnimationFrame and browser resize
 *
 * @class
 */
class Renderer {

	/**
     * @param {Renderer_initData} initData - Data used to initialise class variables
     */
	constructor() {
        
	}

	/**
     * 
     * @param {*} initData 
     */
	initialise(initData) {
		this._initVars(initData);
		this._setup();
	}

	/**
     * 
     */
	get app() {
		return this._pixi;
	}

	/**
     * The PIXI canvas element
     *
     * @readonly
     * @member {HTMLCanvasElement}
     * @returns {HTMLCanvasElement}
     */
	get canvas() {
		return this._pixiRenderer.view;
	}

	/**
     * Use to get access to pixi's stage
     * @readonly
     * @returns {PIXI.Container} Pixi stage
     */
	get stage() {
		return this._pixi.stage;
	}

	/**
     * 
     * @param {*} child 
     */
	addChild(child) {
		this._gameContainer.addChild(child);
	}
    
	/**
     * Starts pixi render and resizes. Also starts requestAnimationFrame
     *
     */
	start() {
		this.browserResized();
		TweenMax.ticker.useRAF(true);
		TweenMax.ticker.addEventListener("tick", this._rafCalculateTimeDeltaMS, this);    
	}

	/**
     * Called when a window.onresize is detected
     */
	browserResized() {
		const { innerHeight, innerWidth } = window;


		this._setLogicalToPhysicalRatio(innerWidth, innerHeight);

		const physicalWidth = Math.ceil(innerWidth * this._logicalToPhysicalRatio);
		const physicalHeight = Math.ceil(innerHeight * this._logicalToPhysicalRatio);

		// now resize the canvas
		this._pixiRenderer.resize(physicalWidth, physicalHeight);
		this._resizeCanvasElementSize(innerWidth, innerHeight);
		this._calculateCanvasScale(physicalWidth, physicalHeight);
	}

	/**
     * Intialisation all renderer variables
     *
     * @private
     * @param {Renderer_initData} initData - Data used to initialise class variables
     */
	_initVars(initData) {
		const { antialias, backgroundAlpha, backgroundColour, gameContainerDiv, height, width } = initData;

		// pixi vars
		this._antialias = antialias;
		this._backgroundAlpha = backgroundAlpha;
		this._backgroundColour = backgroundColour;
		this._gameContainerDiv = gameContainerDiv;
		this._initialWidth = width;
		this._initialHeight = height;

		// class vars
		this._elementWidth = 0;
		this._elementHeight = 0;
		this._innerWidth = 0;
		this._innerHeight = 0;
		this._logicalToPhysicalRatio = 1;
		this._paused = false;
		this._speedModifier = 1;
		this._usingTweenMaxRAF = true;

		this._pixi = null;
		this._pixiRenderer = null;

		this._lastTime = 0;
		this.TARGET_FPMS = 0.06;
		this.TIME_DELTA_CAP = 200;
	}

	/**
     * Setup the renderer
     *
     * @private
     */
	_setup() {
		this._create();
	}

	/**
     * Creates the renderer
     *
     * @private
     */
	_create() {

		this._pixi = new PIXI.Application({
			autoStart: true,
			background: this._backgroundColour,
			height: this._initialHeight,
			resolution: 1,
			width: this._initialWidth
		});
		this._pixiRenderer = this._pixi.renderer;

		this._pixiRenderer.view.style.position = "absolute";
		this._pixiRenderer.view.style.display = "block";
		this._pixiRenderer.view.style.margin = "auto";
		this._pixiRenderer.view.style.padding = "0px";

		this._pixiRenderer.resize(window.innerWidth, window.innerHeight);

		if (this._gameContainerDiv) {
			this._gameContainerDiv.appendChild(this._pixi.view);
		}

		this._gameContainer = new PIXI.Container();
		this._gameContainer.id = "gameContainer";
		this.stage.addChild(this._gameContainer);

		this._enablePixiInspector();
	}

	/**
     * Enable pixi inspector 
     * 
     * @private
     */
	_enablePixiInspector() {
		// pixi inspector ^2.X.X
		/* eslint-disable-next-line */
        globalThis.__PIXI_APP__ = this._pixi;

		// pixi inspector ^0.X.X - legacy pixi inspector can probably be removed in future
		/* eslint-disable no-underscore-dangle */
		window.__PIXI_INSPECTOR_GLOBAL_HOOK__ && window.__PIXI_INSPECTOR_GLOBAL_HOOK__.register({ PIXI: PIXI });
    
	}

	/**
     * Checks to see if the window size has changed and triggers a resize if needed
     *
     * @private
     */
	_checkForResize() {
		const { innerWidth, innerHeight } = window;

		if (innerWidth !== this._innerWidth || innerHeight !== this._innerHeight) {
			this._innerWidth = innerWidth;
			this._innerHeight = innerHeight;
			this.browserResized();
		}
	}

	/**
     * Resizes the canvas element size, the underlying canvas dimensions are NOT affected
     *
     * @private
     * @param {number} newWidth - the new display width of the canvas element
     * @param {number} newHeight - the new display height of the canvas element
     */
	_resizeCanvasElementSize(newWidth, newHeight) {
		this._elementWidth = Math.ceil(newWidth);
		this._elementHeight = Math.ceil(newHeight);

		this._pixiRenderer.view.style.width = this._elementWidth + "px";
		this._pixiRenderer.view.style.height = this._elementHeight + "px";
	}

	/**
     * Sets up the Local to physical ratio to scale the game
     * This will never go over the window.devicePixelRatio
     * This is set up to stop the canvas being drawn bigger than it needs to be
     *
     * @private
     * @param {number} width - window width
     * @param {number} height - window height
     */
	_setLogicalToPhysicalRatio(width, height) {
		const ratioW = (this._initialWidth * 2) / width;
		const ratioH = (this._initialHeight * 2) / height;
		let calculatedLogicalToPhysicalRatio = 1;

		if (ratioW > ratioH) {
			calculatedLogicalToPhysicalRatio = ratioW;
		}
		else {
			calculatedLogicalToPhysicalRatio = ratioH;
		}

		if (calculatedLogicalToPhysicalRatio > window.devicePixelRatio) {
			calculatedLogicalToPhysicalRatio = window.devicePixelRatio;
		}

		this._logicalToPhysicalRatio = calculatedLogicalToPhysicalRatio;
	}


	/**
     * Calculates the timeDealtaMS when using our own requestAnimation event
     *
     * @private
     * @param {DOMHighResTimeStamp} timeNow -
     */
	_rafCalculateTimeDeltaMS() {
		const timeNow = window.performance.now();
		const timeDeltaMS = (timeNow - this._lastTime);

		this._lastTime = timeNow;

		this._raf(timeDeltaMS);
	}

	/**
     * Fires event sending timeDeltas
     *
     * @private
     * @param {number} timeDeltaMS -
     */
	_raf(timeDeltaMS) {
		if (this._paused) {
			timeDeltaMS = 0;
		}
		else if (timeDeltaMS > this.TIME_DELTA_CAP) {
			timeDeltaMS = this.TIME_DELTA_CAP;
		}

		this._checkForResize();

		this._pixiRenderer.reset();
		this._pixiRenderer.render(this._pixi.stage);
	}
    
	/**
     * Calculates scale of the canvas - called on a resize
     *
     * @private
     * @param {number} currentCanvasWidth - width of the canvas (width * this._logicalToPhysicalRatio)
     * @param {number} currentCanvasHeight - height of the canvas (height * this._logicalToPhysicalRatio)
     */
	_calculateCanvasScale(currentCanvasWidth, currentCanvasHeight) {
		const ratioWidth = currentCanvasWidth / this._initialWidth;
		const ratioHeight = currentCanvasHeight / this._initialHeight;
		let scale = 1;
		let calculatedCanvasWidth = 0;
		let calculatedCanvasHeight = 0;

		if (ratioWidth > ratioHeight) {
			scale = ratioHeight;
			calculatedCanvasWidth = (this._initialWidth * ratioHeight);
			calculatedCanvasHeight = (this._initialHeight * ratioHeight);
		}
		else {
			scale = ratioWidth;
			calculatedCanvasWidth = (this._initialWidth * ratioWidth);
			calculatedCanvasHeight = (this._initialHeight * ratioWidth);
		}
		this._gameContainer.x = (currentCanvasWidth - calculatedCanvasWidth) * 0.5;
		this._gameContainer.y = (currentCanvasHeight - calculatedCanvasHeight) * 0.5;
		this._gameContainer.scale.x = scale;
		this._gameContainer.scale.y = scale;
	}
}

export const renderer = new Renderer();