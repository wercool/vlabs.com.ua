import '@babel/polyfill';
import * as THREE from 'three';
import * as HTTPUtils from '../utils/http.utils';
import * as VLabUtils from '../utils/vlab.utils.js';
import * as THREEUtils from '../utils/three.utils';
import VLabDOMManager from './vlab.dom.manager';
import VLabEventDispatcher from './vlab.event.dispatcher';
import VLabSceneDispatcher from './vlab.scene.dispatcher';
import VLabsRESTClientManager from '../aux/rest.vlabs.client/manager';
import VLabsFFClientManager from '../aux/ff.vlabs.client/manager';
/**
 * Post Processing
 * https://vanruesc.github.io/postprocessing/public/docs/
 */
import { EffectComposer, Pass, RenderPass, EffectPass, OutlineEffect } from "postprocessing";

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
         * Bind requestAnimationFrame to this
         */
        this.requestAnimationFrame = this.requestAnimationFrame.bind(this);
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
        /**
         * List of prefab elements
         * @param {CircleBufferGeometry} respondentIntersectionPoint
         * @param {MeshBasicMaterial} respondentIntersectionPointMaterial
         */
        this.prefabs = {};
        /**
         * 
         * 
         * Extend Postprocessing
         * Override Pass.prototype.setFullscreenMaterial to support PlaneBufferGeometry dispose
         * 
         * 
         */
        Pass.prototype.setFullscreenMaterial = function(material) {
            var quad = this.quad;

            if (quad !== null) {
                quad.material = material;
            } else {
                this.quadGeometry = new THREE.PlaneBufferGeometry(2, 2);
                quad = new THREE.Mesh(this.quadGeometry, material);
                quad.frustumCulled = false;

                if (this.scene !== null) {
                    this.scene.add(quad);
                    this.quad = quad;
                }
            }
        };
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
                     * VLabsRESTClientManager
                     * @public
                     */
                    this.VLabsRESTClientManager = new VLabsRESTClientManager(this);

                    this.VLabsRESTClientManager
                    .AuthService
                    .authenticate({
// username: 'vlabs.com.ua@gmail.com',
// password: 'dbrnjhbz1989'
username: 'maskame@gmail.com',
password: '123'
                    })
                    .then((result) => {
                        console.log(result);
                        /**
                         * Reterieve UserDetails
                         */
                        this.VLabsRESTClientManager
                        .AuthService
                        .userDetails()
                        .then((result) => {
                            // console.log(result);
                        })
                        .catch((error) => {
                            // console.error(error);
                        });
                        /**
                         * VLabs REST WS
                         */
                        this.VLabsRESTClientManager
                        .WSBasicService
                        .connect();

                        /**
                         * VLab EventDispatcher {@link VLabEventDispatcher} instance
                         * @public
                         */
                        this.EventDispatcher = new VLabEventDispatcher(this);
                        /**
                         * VLabs FF Client Manager {@link VLabsFFClientManager} instance
                         * @public
                         */
                        this.FFClientManager = new VLabsFFClientManager(this);
                        /**
                         * VLab SceneDispatcher {@link VLabSceneDispatcher} instance
                         * @public
                         */
                        this.SceneDispatcher = new VLabSceneDispatcher(this);

                        /**
                         * VLab DOMManager manager {@link VLabDOMManager} instance
                         * @public
                         */
                        this.DOMManager = new VLabDOMManager(this);
                        this.DOMManager.initialize().then(() => {
                            /**
                             * Fills this.vLab.prefabs with initial objects
                             */
                            VLabUtils.initializeVLabPrefabs(this).then((prefabs) => {
                                this.prefabs = prefabs;

                                this.setupWebGLRenderer();

                                this.requestAnimationFrame();

                                /**
                                 * resolves initialization Promise
                                 */
                                resolve({});
                            });
                        }).catch((error) => { reject(error); });
                    })
                    .catch((error) => {
                        /**
                         * VLabs REST Auth failed
                         */
                        // console.error(error.status);
                    });
                }).catch((error) => { reject(error); });
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
     *  @param {boolean} forcedly
     * @memberof VLab
     */
    setupWebGLRenderer(forcedly) {
        if (this.WebGLRendererCanvas == undefined) {
            /**
             * HTMLCanvasElement to render current VLabScene
             * @public
             */
            this.WebGLRendererCanvas = document.createElement('canvas');
            this.WebGLRendererCanvas.id = 'WebGLRendererCanvas';
            this.WebGLRendererCanvas.classList.add('hidden');
            this.EventDispatcher.addWebGLRendererCanvasEventListeners();

            this.DOMManager.WebGLContainer.appendChild(this.WebGLRendererCanvas);

            this.WebGLRendererCanvasOverlay = document.createElement('div');
            this.WebGLRendererCanvasOverlay.id = 'WebGLRendererCanvasOverlay';
            this.WebGLRendererCanvasOverlay.classList.add('hidden');
            this.DOMManager.WebGLContainer.appendChild(this.WebGLRendererCanvasOverlay);
        }

        if (this.WebGLRenderer == undefined || forcedly == true) {
            /**
             * THREE.WebGLRenderer
             * @see https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer
             * @public
             */
            this.WebGLRenderer = new THREE.WebGLRenderer({
                canvas: this.WebGLRendererCanvas,
                antialias: false,
                powerPreference: 'high-performance',
                precision: 'lowp'
            });

            this.WebGLRenderer.gammaOutput = true;

            this.WebGLRenderer.setPixelRatio(1.0);

            if (this.getProdMode() || window.location.href.indexOf('localhost') > -1) {
                this.WebGLRenderer.context.getShaderInfoLog = function () { return '' };
                this.WebGLRenderer.context.getProgramInfoLog = function () { return '' };
            }
        }
    }
    /**
     * Configure minor WebGLRenderer parameters
     */
    configureWebGLRenderer() {
        if (this.WebGLRenderer !== undefined) {
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
                    if (this.effectComposer == undefined) {
                        this.effectComposer = new EffectComposer(this.WebGLRenderer);
                    }

                    this.effectComposer.reset();

                    if (this.effectComposer.renderer !== this.WebGLRenderer) {
                        this.effectComposer.replaceRenderer(this.WebGLRenderer);
                    }

                    if (this.outlineEffect !== undefined) {
                        this.outlineEffect.dispose();
                    }
                    this.outlineEffect = new OutlineEffect(this.SceneDispatcher.currentVLabScene, this.SceneDispatcher.currentVLabScene.currentCamera, {
                        edgeStrength: 2.0,
                        visibleEdgeColor: 0xffff00,
                        hiddenEdgeColor: 0xffff00,
                    });


                    if (this.renderPass != undefined) {
                        this.renderPass.dispose();
                    }
                    this.renderPass = new RenderPass(this.SceneDispatcher.currentVLabScene, this.SceneDispatcher.currentVLabScene.currentCamera);
                    this.renderPass.renderToScreen = true;
                    this.effectComposer.addPass(this.renderPass);

                    if (this.outlinePass != undefined) {
                        this.outlinePass.dispose();
                        THREEUtils.completeDispose(this.outlinePass.scene);
                    }
                    this.outlinePass = new EffectPass(this.SceneDispatcher.currentVLabScene.currentCamera, this.outlineEffect);
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
        if (this.WebGLRendererCanvas && this.WebGLRendererCanvas.classList.contains('hidden')) this.WebGLRendererCanvas.classList.remove('hidden');
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
        if (this.WebGLRenderer != undefined) {
            this.WebGLRenderer.setSize(this.DOMManager.WebGLContainer.clientWidth  * resolutionFactor, 
                                    this.DOMManager.WebGLContainer.clientHeight * resolutionFactor,
                                    false);

            this.WebGLRenderer.domElement.style.width  = this.DOMManager.WebGLContainer.clientWidth  + 'px';
            this.WebGLRenderer.domElement.style.height = this.DOMManager.WebGLContainer.clientHeight + 'px';
        }

        /* Update this.SceneDispatcher.currentVLabScene.currentCamera aspect according to WebGLRenderer size */
        if (this.SceneDispatcher.currentVLabScene.currentCamera) {
            this.SceneDispatcher.currentVLabScene.currentCamera.aspect = (this.WebGLRendererCanvas.clientWidth / this.WebGLRendererCanvas.clientHeight);
            this.SceneDispatcher.currentVLabScene.currentCamera.updateProjectionMatrix();
        }

        if (this.effectComposer != undefined) {
            this.effectComposer.setSize(this.WebGLRenderer.getSize());
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
            this.render(time);
            TWEEN.update(time);
            if (this.nature.simpleStats) this.DOMManager.simpleStats.end();
            /*<dev>*/
                this.DOMManager.rendererStats.update(this.WebGLRenderer);
            /*</dev>*/
        } else {
            setTimeout(this.requestAnimationFrame, 250);
        }
    }
    /**
     * Actually renders current VLabScene from SceneDispatcher with or without postprocessing (EffectComposer).
     *
     * @memberof VLab
     */
    render(time) {
        let delta = this.clock.getDelta();
        if (this.effectComposer) {
            this.WebGLRenderer.clear();
            this.effectComposer.render(delta);
        } else {
            this.WebGLRenderer.render(this.SceneDispatcher.currentVLabScene, this.SceneDispatcher.currentVLabScene.currentCamera);
        }
        this.fps = 1 / delta;

        this.EventDispatcher.notifySubscribers({
            type: 'framerequest',
            target: this.WebGLRendererCanvas,
            dt: delta
        });

        requestAnimationFrame(this.requestAnimationFrame);
    }
}
export default VLab;