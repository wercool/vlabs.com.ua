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
     * Instantiates THREE.WebGLRenderer.
     * * Configures THREE.WebGLRenderer according to this.nature.WebGLRendererParameters
     *
     * @memberof VLab
     */
    setupWebGLRenderer() {
        /**
         * HTMLCanvasElement to render current VLabScene
         * @inner
         */
        this.WebGLRendererCanvas = document.createElement('canvas');
        this.WebGLRendererCanvas.id = 'vLabWebGLRendererCanvas';
        this.WebGLRendererCanvas.addEventListener('contextmenu', function(event) {
            if (event.button == 2) {
                event.preventDefault();
            }
        });
        /**
         * THREE.WebGLRenderer
         * https://threejs.org/docs/index.html#api/en/renderers/WebGLRenderer
         * @inner
         */
        this.WebGLRenderer = new THREE.WebGLRenderer({
            canvas: this.WebGLRendererCanvas
        });
        //TODO: this.WebGLRenderer.setClearColor
        this.WebGLRenderer.setClearColor(0x00ff00);
        this.DOM.webGLContainer.appendChild(this.WebGLRenderer.domElement);
    }
    /**
     * Resizes THREE.WebGLRenderer.
     *
     * @memberof VLab
     */
    resizeWebGLRenderer() {
        let resolutionFactor = 1.0;
        if (this.nature.WebGLRendererParameters) {
            if (this.nature.WebGLRendererParameters.resolutionFactor) {
                resolutionFactor = this.nature.WebGLRendererParameters.resolutionFactor;
            }
        }
        if (this.SceneDispatcher.currentVLabScene.nature.WebGLRendererParameters) {
            if (this.SceneDispatcher.currentVLabScene.nature.WebGLRendererParameters.resolutionFactor) {
                resolutionFactor = this.SceneDispatcher.currentVLabScene.nature.WebGLRendererParameters.resolutionFactor;
            }
        }
        this.WebGLRenderer.setSize(this.DOM.webGLContainer.clientWidth  * resolutionFactor, 
                                   this.DOM.webGLContainer.clientHeight * resolutionFactor,
                                   false);
        if (this.WebGLRenderer.domElement) {
            this.WebGLRenderer.domElement.style.width  = this.DOM.webGLContainer.clientWidth  + 'px';
            this.WebGLRenderer.domElement.style.height = this.DOM.webGLContainer.clientHeight + 'px';
        }
        if (this.SceneDispatcher.currentVLabScene.currentCamera) {
            this.SceneDispatcher.currentVLabScene.currentCamera.aspect = (this.DOM.webGLContainer.clientWidth / this.DOM.webGLContainer.clientHeight);
            this.SceneDispatcher.currentVLabScene.currentCamera.updateProjectionMatrix();
        }
    }
    /**
     * Renders SceneDispatcher active VLabScene with THREE.WebGLRenderer.
     *
     * @memberof VLab
     */
    render() {
        if (!this.renderPause) {
            this.WebGLRenderer.clear();
            this.WebGLRenderer.render(this.SceneDispatcher.currentVLabScene, this.SceneDispatcher.currentVLabScene.currentCamera);
            requestAnimationFrame(this.render.bind(this));
        } else {
            console.log('render paused...');
            setTimeout(this.render.bind(this), 250);
        }
    }
}
export default VLab;