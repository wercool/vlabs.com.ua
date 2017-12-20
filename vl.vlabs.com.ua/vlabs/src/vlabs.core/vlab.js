import * as THREE from 'three';
import THREEStats from 'stats.js';
import * as HTTPUtils from "./utils/http.utils"
import { Stats } from 'fs';

var ProgressBar = require('progressbar.js');

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
        this.paused = true;
        this.nature = {};
        this.webGLContainer = undefined;
        this.webGLRenderer = undefined;
        this.statsTHREE = undefined;

        this.vLabScene = undefined;
        this.defaultCamera = undefined;

        this.progressBar = undefined;
        this.progressBarPrependText = "";
    }

    getVesrion() {
        return "0.0.2";
    }

    initialize() {
        return Promise.all([
            this.getNatureFromURL((this.initObj.natureURL) ? this.initObj.natureURL : "./resources/nature.json")
        ])
        .then((result) => {
            let [ nature ] = result;
            this.nature = nature;

            this.setProgressBar();

            return result;
        })
        .catch(error => {
            console.error(error);
        });
    }

    setWebGLRenderer() {
        this.webGLContainer = document.getElementById(this.initObj.webGLContainer);
        this.webGLContainer.style.display = 'none';

        window.onresize = this.resiezeWebGLContainer.bind(this);

        this.webGLRenderer = new THREE.WebGLRenderer({

        });

        this.webGLRenderer.setClearColor(0x000000);

        this.webGLContainer.appendChild(this.webGLRenderer.domElement);

        this.resiezeWebGLContainer();

        this.render();
    }

    resiezeWebGLContainer() {
        if (this.nature.resolutionFactor && Number(this.nature.resolutionFactor) != 1.0) {
            this.webGLRenderer.setSize(this.webGLContainer.clientWidth  * this.nature.resolutionFactor, 
                                       this.webGLContainer.clientHeight * this.nature.resolutionFactor,
                                       false);
            this.webGLRenderer.domElement.style.width  = this.webGLContainer.clientWidth  + 'px';
            this.webGLRenderer.domElement.style.height = this.webGLContainer.clientHeight + 'px';
        } else {
            this.webGLRenderer.setSize(this.webGLContainer.clientWidth, this.webGLContainer.clientHeight);
        }
        if (this.defaultCamera) {
            this.defaultCamera.aspect = (this.webGLContainer.clientWidth / this.webGLContainer.clientHeight);
            this.defaultCamera.updateProjectionMatrix();
        }
    }

    setProgressBar() {
        this.progressBar = new ProgressBar.Line("#progressBar", {
            strokeWidth: 4,
            easing: 'easeInOut',
            duration: 50,
            color: '#657da1',
            trailColor: '#eee',
            trailWidth: 0.25,
            svgStyle: { width: '100%', height: '100%' },
            text: {
                style: {
                    color: '#999',
                    position: 'absolute',
                    right: '0',
                    top: '40px',
                    padding: 0,
                    margin: 0,
                    transform: null
                },
                autoStyleContainer: true
            },
            from: {color: '#FFEA82'},
            to: {color: '#ED6A5A'},
            step: (state, bar) => {
                bar.setText(this.progressBarPrependText + Math.round(bar.value() * 100) + ' %');
            }
        });
    }

    setDefaultCamera(defaultCamera) {
        if (defaultCamera) {
            this.defaultCamera = defaultCamera;
            return;
        }

        if (this.nature.defaultSceneCamera) {
            this.defaultCamera = this.vLabScene.getObjectByName(this.nature.defaultSceneCamera);
        } else {
            this.defaultCamera = new THREE.PerspectiveCamera(70, this.webGLContainer.clientWidth / this.webGLContainer.clientHeight, 0.1, 200);
        }
    }

    setVLabScene(vLabScene) {
        // console.log(vLabScene);
        // return;

        // vLabScene.traverse(function(obj) {
        //     console.log(obj);
        // });

        this.vLabScene = (vLabScene) ? vLabScene : new THREE.Scene();

        this.activate();
    }

    activate() {
        this.setWebGLRenderer();

        if (this.nature.showTHREEStats) {
            this.setTHREEStats();
        }

        this.setDefaultCamera();

        document.getElementById("progressBarContainer").style.display = 'none';

        this.webGLContainer.style.display = 'block';
        this.resiezeWebGLContainer();

        this.initialized = true;
        this.paused = false;
    }

    loadScene() {
        return new Promise((resolve, reject) => {
            let thisVLab = this;
            if (this.nature.sceneJSONFile) {
                let loader = new THREE.ObjectLoader();
                loader.convertUpAxis = true;
                loader.load(this.nature.sceneJSONFile, 
                    // onLoad callback
                    function (vLabScene) {
                        resolve(vLabScene);
                    },
                    // onProgress callback
                    function (bytes) {
                        let loadedRel = (bytes.loaded / bytes.total).toFixed(2);
                        console.info(thisVLab.nature.title + " scene " + (loadedRel * 100).toFixed(2) + "% loaded");

                        if (thisVLab.progressBar) {
                            thisVLab.progressBarPrependText = "The world of VLab is loaded by ";
                            thisVLab.progressBar.animate(loadedRel);
                        }
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

    getNatureFromURL(url) {
        return HTTPUtils.getJSONFromURL(url);
    }

    render() {
        if (this.initialized && !this.paused) {
            if (this.statsTHREE) this.statsTHREE.begin();

                this.webGLRenderer.clear();
                this.webGLRenderer.render(this.vLabScene, this.defaultCamera);

            if (this.statsTHREE) this.statsTHREE.end();

            requestAnimationFrame(this.render.bind(this));
        } else {
            setTimeout(this.render.bind(this), 250);
        }
    }

    setTHREEStats() {
        this.statsTHREE = new THREEStats();
        this.statsTHREE.domElement.style.position = 'absolute';
        this.statsTHREE.domElement.style.left = '0px';
        this.statsTHREE.domElement.style.top = '0px';
        document.body.appendChild(this.statsTHREE.domElement);
    }
}