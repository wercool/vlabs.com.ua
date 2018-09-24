import * as THREE from 'three';
import * as HTTPUtils from '../utils/http.utils';
import VLabDOM from './vlab.dom';
import VLabEventDispatcher from './vlab.event.dispatcher';
import VLabSceneDispatcher from './vlab.scene.dispatcher';

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
         * @inner
         */
        this.clock = new THREE.Clock();

        /**
         * render pause
         * @inner
         */
        this.renderPause = true;

        this.getNaturePassphrase        = () => { return  '<!--VLAB NATURE PASSPHRASE-->' };
        this.getProdMode                = () => { return  '<!--VLAB PROD MODE-->' == 'true' };
    }
    /**
     * VLab initializer.
     * * Verifies initObj
     * * Loads VLab nature
     * * Instantiates VLabDOM
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
                     * @inner
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
                     * VLab DOM manager
                     * @inner
                     */
                    this.DOM = new VLabDOM(this);
                    this.DOM.initialize().then(() => {
                        /**
                         * VLab EventDispatcher
                         * @inner
                         */
                        this.EventDispatcher = new VLabEventDispatcher(this);
                        /**
                         * VLab SceneDispatcher
                         * @inner
                         */
                        this.SceneDispatcher = new VLabSceneDispatcher(this);
                        /**
                         * Instantiates THREE.WebGLRenderer and configures it accordingly
                         */
                        this.setupWebGLRenderer();

                        this.render();

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
     * * Appends this.WebGLRenderer.domElement (this.WebGLRendererCanvas) to this.DOM.WebGLContainer
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
             * @inner
             */
            this.WebGLRendererCanvas = document.createElement('canvas');
            this.WebGLRendererCanvas.id = 'WebGLRendererCanvas';
            this.WebGLRendererCanvas.classList.add('hidden');
            this.EventDispatcher.addWebGLRendererCanvasEventListeners();
            /**
             * THREE.WebGLRenderer
             * https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer
             * @inner
             */
            this.WebGLRenderer = new THREE.WebGLRenderer({
                canvas: this.WebGLRendererCanvas
            });
            this.WebGLRenderer.setPixelRatio(1.0);
            if (this.getProdMode()) {
                this.WebGLRenderer.context.getShaderInfoLog = function () { return '' };
                this.WebGLRenderer.context.getProgramInfoLog = function () { return '' };
            }

            this.DOM.WebGLContainer.appendChild(this.WebGLRenderer.domElement);
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
        this.WebGLRenderer.setSize(this.DOM.WebGLContainer.clientWidth  * resolutionFactor, 
                                   this.DOM.WebGLContainer.clientHeight * resolutionFactor,
                                   false);
        /* Update this.SceneDispatcher.currentVLabScene.currentCamera aspect according to WebGLRenderer size */
        if (this.SceneDispatcher.currentVLabScene.currentCamera) {
            this.SceneDispatcher.currentVLabScene.currentCamera.aspect = (this.WebGLRendererCanvas.clientWidth / this.WebGLRendererCanvas.clientHeight);
            this.SceneDispatcher.currentVLabScene.currentCamera.updateProjectionMatrix();
        }
    }
    /**
     * Renders SceneDispatcher active VLabScene with this.WebGLRenderer type of THREE.WebGLRenderer.
     *
     * @memberof VLab
     */
    render() {
        if (!this.renderPause) {
            this.WebGLRenderer.clear();
            this.WebGLRenderer.render(this.SceneDispatcher.currentVLabScene, this.SceneDispatcher.currentVLabScene.currentCamera);
            requestAnimationFrame(this.render.bind(this));
        } else {
            setTimeout(this.render.bind(this), 250);
            console.log('render paused...');
        }
    }
}
export default VLab;