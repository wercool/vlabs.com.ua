import '@babel/polyfill';
import * as THREE from 'three';
import * as HTTPUtils from '../utils/http.utils';
import VLabDOMManager from './vlab.dom.manager';
import VLabEventDispatcher from './vlab.event.dispatcher';
import VLabSceneDispatcher from './vlab.scene.dispatcher';
import { EffectComposer, RenderPass, OutlinePass } from "postprocessing";

var TWEEN = require('@tweenjs/tween.js');

/**
 * VLab base class.
 * @class
 * @classdesc VLab base class serves infrastructure for elements in any VLab, creating for them common context.
 */
class VLab {
    /**
     * VLab constructor.
     * @constructor
     * @param {Object} initObj                      - Initialization Object
     * @param {string} initObj.name                 - VLab name
     * @param {string} initObj.natureURL            - VLab nature JSON file URL
     */
    constructor(initObj = {}) {
        this.initObj = initObj;
        /**
         * THREE.Clock
         * @public
         */
        this.clock = new THREE.Clock();
        /**
         * render pause
         * @public
         */
        this.renderPaused = true;
        /**
         * Current FPS
         * @public
         */
        this.fps = 60;
        /**
         * VLAB NATURE PASSPHRASE @type {string}
         * @public
         */
        this.getNaturePassphrase        = () => { return  '<!--VLAB NATURE PASSPHRASE-->' };
        /**
         * Development of production mode @type {boolean}
         * @public
         */
        this.getProdMode                = () => { return  '<!--VLAB PROD MODE-->' == 'true' };
    }
    /**
     * VLab initializer.
     * * Verifies initObj
     * * Loads VLab nature
     * * Instantiates VLabDOMManager
     * * Instantiates VLabEventDispatcher
     * * Instantiates VLabSceneDispatcher
     * * Instantiates THREE.WebGLRenderer and configures it
     *
     * @async
     * @memberof VLab
     */
    initialize() {
        return new Promise((resolve, reject) => {
            let initObjAbnormals = [];
            if (this.initObj.name == undefined)      initObjAbnormals.push('this.initObj.name is not set');
            if (this.initObj.natureURL == undefined) initObjAbnormals.push('this.initObj.natureURL is not set');
            if (initObjAbnormals.length == 0) {
                HTTPUtils.getJSONFromURL(this.initObj.natureURL, this.getNaturePassphrase())
                .then((nature) => {
                    /**
                     * VLab nature
                     * @public
                     * @property {Object} nature                                                    - VLab nature from JSON file from constructor initObj.natureURL
                     * @property {string} nature.name                                               - VLab name
                     * @property {Object} [nature.styles]                                           - VLab CSS styles
                     * @property {string} [nature.styles.global]                                    - global CSS, overrides /vlab.assets/css/global.css
                     * @property {Object} [nature.WebGLRendererParameters]                          - THREE.WebGLRenderer parameters and presets
                     * @property {Object} [nature.WebGLRendererParameters.resolutionFactor]         - THREE.WebGLRenderer resolution factor
                     * 
                     */
                    this.nature = nature;


                    /**
                     * VLab DOMManager manager {@link VLabDOMManager} instance
                     * @public
                     */
                    this.DOMManager = new VLabDOMManager(this);
                    this.DOMManager.initialize().then(() => {
                        /**
                         * VLab EventDispatcher {@link VLabEventDispatcher} instance
                         * @public
                         */
                        this.EventDispatcher = new VLabEventDispatcher(this);
                        /**
                         * VLab SceneDispatcher {@link VLabSceneDispatcher} instance
                         * @public
                         */
                        this.SceneDispatcher = new VLabSceneDispatcher(this);

                        this.setupWebGLRenderer();

                        this.requestAnimationFrame();

                        /**
                         * resolves initialization Promise
                         */
                        resolve({});
                    });
                })
                .catch((error) => { reject(error); });
            } else {
                if (initObjAbnormals.length > 0) {
                    console.error('VLab incorrectly initialized!');
                    reject(initObjAbnormals);
                }
            }
        });
    }
    /**
     * Instantiates main THREE.WebGLRenderer if not yet instantiated.
     * * Appends this.WebGLRenderer.domElement (this.WebGLRendererCanvas) to this.DOMManager.WebGLContainer
     * * Configures THREE.WebGLRenderer according to this.nature.WebGLRendererParameters
     * * Configures THREE.WebGLRenderer according to this.SceneDispatcher.currentVLabScene.nature.WebGLRendererParameters
     *   if this.SceneDispatcher.currentVLabScene.nature is defined
     *
     * @memberof VLab
     */
    setupWebGLRenderer() {
        if (this.WebGLRenderer === undefined) {
            /**
             * HTMLCanvasElement to render current VLabScene
             * @public
             */
            this.WebGLRendererCanvas = document.createElement('canvas');
            this.WebGLRendererCanvas.id = 'WebGLRendererCanvas';
            this.WebGLRendererCanvas.classList.add('hidden');
            this.EventDispatcher.addWebGLRendererCanvasEventListeners();
            /**
             * THREE.WebGLRenderer
             * @see https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer
             * @public
             */
            this.WebGLRenderer = new THREE.WebGLRenderer({
                canvas: this.WebGLRendererCanvas,
                powerPreference: 'high-performance',
                precision: 'lowp'
            });
            this.WebGLRenderer.setPixelRatio(1.0);
            if (this.getProdMode()) {
                this.WebGLRenderer.context.getShaderInfoLog = function () { return '' };
                this.WebGLRenderer.context.getProgramInfoLog = function () { return '' };
            }

            this.DOMManager.WebGLContainer.appendChild(this.WebGLRenderer.domElement);
        }
        /* Configures THREE.WebGLRenderer according to this.nature.WebGLRendererParameters */
        if (this.nature.WebGLRendererParameters) {
            if (this.nature.WebGLRendererParameters.clearColor)
                this.WebGLRenderer.setClearColor(parseInt(this.nature.WebGLRendererParameters.clearColor));
        }
        /** Configures THREE.WebGLRenderer according to this.SceneDispatcher.currentVLabScene.nature.WebGLRendererParameters
         *  if this.SceneDispatcher.currentVLabScene.nature is defined
         */
        if (this.SceneDispatcher.currentVLabScene.nature) {
            if (this.SceneDispatcher.currentVLabScene.nature.WebGLRendererParameters) {
                if (this.SceneDispatcher.currentVLabScene.nature.WebGLRendererParameters.clearColor)
                    this.WebGLRenderer.setClearColor(parseInt(this.SceneDispatcher.currentVLabScene.nature.WebGLRendererParameters.clearColor));
            }
        }
    }
    /**
     * Instantiates EffectComposer if not yet instantiated.
     */
    setupEffectComposer() {
        if (this.nature.WebGLRendererParameters) {
            if (this.nature.WebGLRendererParameters.effectComposer) {
                if (this.SceneDispatcher.currentVLabScene) {
                    /**
                     * Postprocessing EffectComposer
                     * @see https://www.npmjs.com/package/postprocessing
                     * @inner
                     * @public
                     */
                    this.effectComposer = new EffectComposer(this.WebGLRenderer);

                    this.renderPass = new RenderPass(this.SceneDispatcher.currentVLabScene, this.SceneDispatcher.currentVLabScene.currentCamera);
                    this.renderPass.renderToScreen = true;
                    this.effectComposer.addPass(this.renderPass);

                    this.outlinePass = new OutlinePass(this.SceneDispatcher.currentVLabScene, this.SceneDispatcher.currentVLabScene.currentCamera, {
                        edgeStrength: 2.0,
                        visibleEdgeColor: 0xffff00,
                        hiddenEdgeColor: 0xffff00,
                    });
                    this.outlinePass.renderToScreen = false;
                }
            }
        }
    }
    /**
     * Resizes THREE.WebGLRenderer.
     * * Sets WebGLRenderer size according to this.nature.WebGLRendererParameters.resolutionFactor if defined
     * * Overrides WebGLRenderer size according to this.SceneDispatcher.currentVLabScene.nature.WebGLRendererParameters.resolutionFactor if defined
     * * Update this.SceneDispatcher.currentVLabScene.currentCamera aspect according to WebGLRenderer size
     * @memberof VLab
     */
    resizeWebGLRenderer() {
        let resolutionFactor = 1.0;
        /* Cheks if this.nature.WebGLRendererParameters.resolutionFactor if defined */
        if (this.nature.WebGLRendererParameters) {
            if (this.nature.WebGLRendererParameters.resolutionFactor) {
                resolutionFactor = this.nature.WebGLRendererParameters.resolutionFactor;
            }
        }
        /* Overrides WebGLRenderer size according to this.SceneDispatcher.currentVLabScene.nature.WebGLRendererParameters.resolutionFactor if defined */
        if (this.SceneDispatcher.currentVLabScene.nature) {
            if (this.SceneDispatcher.currentVLabScene.nature.WebGLRendererParameters) {
                if (this.SceneDispatcher.currentVLabScene.nature.WebGLRendererParameters.resolutionFactor) {
                    resolutionFactor = this.SceneDispatcher.currentVLabScene.nature.WebGLRendererParameters.resolutionFactor;
                }
            }
        }
        /* Sets WebGLRenderer size according to this.nature.WebGLRendererParameters.resolutionFactor if defined */
        this.WebGLRenderer.setSize(this.DOMManager.WebGLContainer.clientWidth  * resolutionFactor, 
                                   this.DOMManager.WebGLContainer.clientHeight * resolutionFactor,
                                   false);
        this.WebGLRenderer.domElement.style.width  = this.DOMManager.WebGLContainer.clientWidth  + 'px';
        this.WebGLRenderer.domElement.style.height = this.DOMManager.WebGLContainer.clientHeight + 'px';
        /* Update this.SceneDispatcher.currentVLabScene.currentCamera aspect according to WebGLRenderer size */
        if (this.SceneDispatcher.currentVLabScene.currentCamera) {
            this.SceneDispatcher.currentVLabScene.currentCamera.aspect = (this.WebGLRendererCanvas.clientWidth / this.WebGLRendererCanvas.clientHeight);
            this.SceneDispatcher.currentVLabScene.currentCamera.updateProjectionMatrix();
        }
    }
    /**
     * window.requestAnimationFrame 
     * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
     * Renders current VLabScene from SceneDispatcher with this.render().
     *
     * @memberof VLab
     */
    requestAnimationFrame(time) {
        if (!this.renderPaused) {
            if (this.nature.simpleStats) this.DOMManager.simpleStats.begin();
            this.EventDispatcher.notifySubscribers({
                type: 'framerequest',
                target: this.WebGLRendererCanvas
            });
            this.render();
            TWEEN.update(time);
            if (this.nature.simpleStats) this.DOMManager.simpleStats.end();
            if (this.nature.rendererStats) this.DOMManager.rendererStats.update(this.WebGLRenderer);
        } else {
            setTimeout(this.requestAnimationFrame.bind(this), 250);
        }
    }
    /**
     * Actually renders current VLabScene from SceneDispatcher with or without postprocessing (EffectComposer).
     *
     * @memberof VLab
     */
    render() {
        this.WebGLRenderer.clear();
        if (this.effectComposer) {
            this.effectComposer.render();
        } else {
            this.WebGLRenderer.render(this.SceneDispatcher.currentVLabScene, this.SceneDispatcher.currentVLabScene.currentCamera);
        }
        this.fps = 1 / this.clock.getDelta();
        requestAnimationFrame(this.requestAnimationFrame.bind(this));
    }
}
export default VLab;