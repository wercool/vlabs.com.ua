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
     * @param {Object}    initObj                           - VLabScene initialization object
     * @param {VLabScene} initObj.class                     - VLabScene Class
     * @param {string}    initObj.natureURL                 - VLab Scene nature JSON URL (encoded)
     */
    constructor(initObj) {
        super();
        this.initObj = initObj;
        this.vLab = this.initObj.vLab;

        this.loading = false;
        this.loaded = false;
        this.active = false;
    }
    /**
     * VLab Scene activator.
     *
     * @async
     * @memberof VLabScene
     */
    activate() {
        return new Promise((resolve, reject) => {
            if (!this.loaded) {
                this.load().then(() => {
                    this.active = true;
                    resolve(this);
                });
            } else {
                this.active = true;
                resolve(this);
            }
        });
    }
    /**
     * VLab Scene deactivator.
     *
     * @memberof VLabScene
     */
    deactivate() {
        this.active = false;
    }
    /**
     * VLab Scene loader.
     *
     * @async
     * @memberof VLabScene
     */
    load() {
        this.loading = true;
        console.log(this.initObj.class.name + ' load initiated');
        return new Promise((resolve, reject) => {
            this.vLab.getNatureFromURL(this.initObj.natureURL, this.vLab.naturePassphrase)
            .then((nature) => {
                this.nature = nature;

                /* gltfURL (GL Transmission Format) */
                if (this.nature.gltfURL) {
                    var loader = new GLTFLoader();
                    let self = this;
                    loader.load(
                        this.nature.gltfURL,
                        function (gltf) {
                            self.loading = false;
                            self.loaded = true;
                            console.log(gltf);
                            resolve();
                        },
                        function (xhr) {
                            console.log(parseInt(xhr.loaded / xhr.total * 100 ) + '% loaded of ' + self.initObj.class.name);
                        },
                        function (error) {
                            console.log('An error happened while loading VLabScene glTF assets:', error);
                        }
                    );
                }
            });
        });
    }
}
export default VLabScene;