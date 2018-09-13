import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import VLab from './vlab';
/**
 * VLab Scene.
 * @class
 * @classdesc VLab Scene class serves VLab Scene and it's auxilaries.
 */
class VLabScene extends THREE.Scene {
    /**
     * VLabScene constructor.
     * @constructor
     * @param {Object} initObj                              - Scene initialization object
     * @param {VLab}   initObj.vLab                         - VLab instance
     */
    constructor(iniObj) {
        super();
        this.iniObj = iniObj;
    }
    /**
     * VLab Scene activator.
     *
     * @async
     * @memberof VLabScene
     */
    activate() {
        return new Promise((resolve, reject) => {
            if (this.children.length == 0) {
                this.load().then(() => {
                    resolve(this);
                });
            } else {
                resolve(this);
            }
        });
    }
    /**
     * VLab Scene loader.
     *
     * @async
     * @memberof VLabScene
     */
    load() {
        return new Promise((resolve, reject) => {
            if (this.iniObj.glTFURL) {
                /* glTF (GL Transmission Format) */
                var loader = new GLTFLoader();
                loader.load(
                    this.iniObj.glTFURL,
                    function (gltf) {
                        console.log(gltf);
                        resolve();
                    },
                    function (xhr) {
                        console.log((xhr.loaded / xhr.total * 100 ) + '% loaded');
                    },
                    function (error) {
                        console.log('An error happened');
                    }
                );
            }
        });
    }
}
export default VLabScene;