import * as THREE from 'three';
import * as HTTPUtils from "./utils/http.utils"

/*
    initObj {
        "natureURL": "",
        "webGLContainer": ""
    }
*/

export default class VLab {

    constructor(initObj = {}) {
        if (this.constructor === VLab) {
            throw new TypeError("Cannot construct VLab instances directly");
        }

        this.initObj = initObj;
        this.initialized = false;
        this.nature = {};
        this.webGLContainer = undefined;
        this.webGLRenderer = undefined;

        this.vlabScene = undefined;
        this.defaultCamera = undefined;
    }

    initialize() {
        return Promise.all([
            this.getNatureFromURL((this.initObj.natureURL) ? this.initObj.natureURL : "./resources/nature.json")
        ])
        .then((result) => {
            let [ nature ] = result;
            this.nature = nature;

            // this.setVLabScene();
            // this.setWebGLRenderer();
            // this.initDefaultCamera();
            // this.render();

            return result;
        })
        .catch(error => {
            console.error(error);
        });
    }

    

    setVLabScene() {
        this.vlabScene = new THREE.Scene();
    }

    setWebGLRenderer() {
        this.webGLContainer = document.getElementById(this.initObj.webGLContainer);
        window.onresize = this.resiezeWebGLContainer.bind(this);
        this.webGLRenderer = new THREE.WebGLRenderer({

        });
        this.webGLRenderer.setClearColor(0x000000);

        this.webGLContainer.appendChild(this.webGLRenderer.domElement);

        this.resiezeWebGLContainer();
    }

    resiezeWebGLContainer() {
        if (this.nature.resolutionRatio && Number(this.nature.resolutionRatio) != 1.0) {
            this.webGLRenderer.setSize(this.webGLContainer.clientWidth  * this.nature.resolutionRatio, 
                                        this.webGLContainer.clientHeight * this.nature.resolutionRatio,
                                        false);
            this.webGLRenderer.domElement.style.width  = this.webGLRenderer.domElement.width * 2 + 'px';
            this.webGLRenderer.domElement.style.height = this.webGLRenderer.domElement.height * 2 + 'px';
            console.log(this.webGLRenderer.domElement);
        } else {
            this.webGLRenderer.setSize(this.webGLContainer.clientWidth,  this.webGLContainer.clientHeight);
        }
    }

    initiDefaultCamera() {
        this.defaultCamera = new THREE.PerspectiveCamera(70, this.webglContainer.width() / this.webglContainer.height(), 0.1, 200);
    }

    loadScene() {
        return new Promise((resolve, reject) => {
            let thisVLab = this;
            if (this.nature.sceneFile) {
                let loader = new THREE.ObjectLoader();
                loader.convertUpAxis = true;
                loader.load(this.nature.sceneFile, 
                    // onLoad callback
                    function (vLabScene) {
                        resolve(vLabScene);
                    },
                    // onProgress callback
                    function (bytes) {
                        console.info(thisVLab.nature.title + " scene " + ((bytes.loaded / bytes.total) * 100).toFixed(2) + "% loaded");
                    },
                    // onError callback
                    function (error) {
                        reject('An error happened while loading vLab scene', error);
                    });
            } else {
                reject("Scene File is missing in VLab nature!");
            }
        });
    }

    getVesrion() {
        return "0.0.1";
    }

    getNatureFromURL(url) {
        return HTTPUtils.getJSONFromURL(url);
    }

    render() {
        this.webGLRenderer.clear();
        this.webGLRenderer.render(this.vlabScene, this.defaultCamera);
        requestAnimationFrame(this.render);
    }
}