import 'babel-polyfill';

require('es6-promise').polyfill();
require('isomorphic-fetch');

import * as THREE                   from 'three';
import THREEStats                   from 'stats.js';
import * as HTTPUtils               from "./utils/http.utils"
import * as TWEEN                   from 'tween.js';
import iziToast                     from 'izitoast';
import request                      from 'request';

var ProgressBar             = require('progressbar.js');
var webglDetect             = require('webgl-detect');
var OrbitControls           = require('./three-orbit-controls/index')(THREE);
var PointerLockControls     = require('./three-pointerlock/index');
var TransformControls       = require('./three-transformcontrols/index');
var CMenu                   = require('./circular-menu/circular-menu.js');
var popupS                  = require('./popups/popupS.min.js');
/*
initObj {
    name: "VLab Name",
    natureURL: "nature.json",
}
*/
export default class VLab {

    constructor(initObj = {}) {
        if (this.constructor === VLab) {
            throw new TypeError("Cannot construct VLab instances directly");
        }

        THREE.ImageUtils.crossOrigin = 'use-credentials';

        this.authenticated = false;
        this.authAttemptFailed = false;

        this.initObj = initObj;

        this.initObj.naturePassphrase = '<!--VLAB NATURE PASSPHRASE-->';
        this.initObj.authRequired = '<!--VLAB AUTH REQUIRED-->';
        this.initObj.prodMode = '<!--VLAB PROD MODE-->';

        this.name = this.initObj.name;
        this.initialized = false;
        this.paused = true;
        this.nature = this.initObj.natureObj ? this.initObj.natureObj : {};
        this.webGLContainer = undefined;
        this.webGLRenderer = undefined;

        /* Events */
        this.sceneCompleteEvent = new Event(this.name + 'SceneCompleteEvent');
        this.activatedEvent     = new Event(this.name + 'ActivatedEvent');
        this.redererFrameEvent  = new Event(this.name + 'RedererFrameEvent');

        this.vLabScene = undefined;
        this.vLabSceneMeshes = [];
        this.defaultCamera = undefined;
        this.defaultCameraInitialPosition = undefined;
        this.defaultCameraControls = undefined;

        this.statsTHREE = undefined;
        this.progressBar = undefined;
        this.progressBarPrependText = "";

        this.webGLContainerEventsSubcribers = {
            renderframe: {},
            mousemove: {},
            mousedown: {},
            mouseup: {},
            touchstart: {},
            touchend: {},
            resetview: {},
            webglcontainerresized: {},
            zoommodein: {},
            zoommodeout: {},
            takenobjectapplication: {},
            stopandhide: {},
            resumeandshow: {}
        };

        this.helpers = {
            "placeHelper": {
                "url": "../vlabs.assets/img/place.png",
                "texture": undefined,
                "sprite": undefined
            },
            "VLabPositioners": []
        };

        this.mouseCoords = new THREE.Vector2();
        this.mouseCoordsRaycaster = new THREE.Vector2();
        this.iteractionRaycaster = new THREE.Raycaster();
        this.responsiveRaycaster = new THREE.Raycaster();
        this.helpersRaycaster = new THREE.Raycaster();
        this.allowedSpaceRaycaster = new THREE.Raycaster();

        this.allowedSpaceCanvas = undefined;
        this.allowedSpaceMapObject = undefined;

        this.interactiveObjects = [];
        this.responosiveObjects = [];
        this.interactivesSuppressorsObjects = [];

        this.hoveredObject = undefined;
        this.hoveredResponsiveObject = undefined;
        this.preSelectedObject = undefined;
        this.selectedObject = undefined;
        this.selectionHelper = undefined;

        this.takenObjects = {};

        this.clock = new THREE.Clock();
    }

    getVesrion() {
        return "0.1.3";
    }

    buildHTML() {

        window.onbeforeunload = function() { 
            console.log('BACK IS DISABLED IN VLabs');
            return false;
        };

        this.container = document.createElement('div');
        this.container.id = this.initObj.name + 'VLabContainer';
        this.container.className = 'vLabConatiner';
        if(document.body != null) {
            document.body.appendChild(this.container);
        }

        this.overlayContainer = document.createElement('div');
        this.overlayContainer.id = this.initObj.name + 'OverlayContainer';
        this.overlayContainer.className = 'overlayContainer';

        this.progressBarElement = document.createElement('div');
        this.progressBarElement.id = this.initObj.name + 'ProgressBar';
        this.progressBarElement.className = 'progressBar';

        this.modalMessage = document.createElement('div');
        this.modalMessage.id = this.initObj.name + 'ModalMessage';
        this.modalMessage.className = 'modalMessage';

        this.overlayContainer.appendChild(this.progressBarElement);
        this.overlayContainer.appendChild(this.modalMessage);

        this.container.appendChild(this.overlayContainer);

        this.webGLContainer = document.createElement('div');
        this.webGLContainer.id = this.initObj.name + 'WebGLContainer';
        this.webGLContainer.className = 'webGLContainer';

        this.container.appendChild(this.webGLContainer);

        this.backFromViewButton = document.createElement('div');
        this.backFromViewButton.id = this.initObj.name + 'BackFromView';
        this.backFromViewButton.className = 'backFromView';

        this.resetViewButton = document.createElement('div');
        this.resetViewButton.id = this.initObj.name + 'ResetView';
        this.resetViewButton.className = 'resetview';

        this.fullscreenButton = document.createElement('div');
        this.fullscreenButton.id = this.initObj.name + 'Fullscreen';
        this.fullscreenButton.className = 'fullscreen';

        this.zoomViewArea = document.createElement('div');
        this.zoomViewArea.id = this.initObj.name + 'ZoomViewArea';
        this.zoomViewArea.className = 'zoomViewArea';
        this.zoomViewArea.opacity = 0.0;

        this.webGLContainer.appendChild(this.zoomViewArea);
        this.webGLContainer.appendChild(this.backFromViewButton);
        this.webGLContainer.appendChild(this.resetViewButton);
        this.webGLContainer.appendChild(this.fullscreenButton);

        this.tooltipPlacer = document.createElement('div');
        this.tooltipPlacer.id = this.initObj.name + 'Tooltip';
        this.tooltipPlacer.className = 'tooltip';

        this.cMenuElement = document.createElement('div');
        this.cMenuElement.id = this.initObj.name + 'CMenuElement';
        this.cMenuElement.className = 'cMenu';

        this.container.appendChild(this.tooltipPlacer);
        this.container.appendChild(this.cMenuElement);
    }

    stopAndHide() {
        for (var stopandhideSubscriberName in this.webGLContainerEventsSubcribers.stopandhide) {
            var subscriber = this.webGLContainerEventsSubcribers.stopandhide[stopandhideSubscriberName];
            subscriber.callback.call(subscriber.instance, event);
        }
        this.paused = true;
        this.statsTHREE.domElement.style.display = 'none';
        this.container.style.display = 'none';
    }

    resumeAndShow() {
        for (var resumeandshowSubscriberName in this.webGLContainerEventsSubcribers.resumeandshow) {
            var subscriber = this.webGLContainerEventsSubcribers.resumeandshow[resumeandshowSubscriberName];
            subscriber.callback.call(subscriber.instance, event);
        }
        this.paused = false;
        this.container.style.display = 'block';
        this.statsTHREE.domElement.style.display = 'block';
        this.resiezeWebGLContainer();
    }

    showErrorMessage(error) {
        this.overlayContainer.style.display = 'block';
        this.modalMessage.style.display = 'block';
        this.modalMessage.innerHTML = error.message ? error.message : error;
        console.log(error);
    }

    showOverlayMessage(message) {
        this.overlayContainer.style.display = 'block';
        this.modalMessage.style.display = 'block';
        this.modalMessage.innerHTML = message;
    }

    preInitialize() {
        this.buildHTML();
        return new Promise((resolve, reject) => {
            if (!webglDetect) {
                let error = { error: 'WebGL Not Supported', 
                              message:'<h3>WebGL (interface allowing the display of the 3D on a website page) ' +
                                      'is not activated or is configured incorrectly.</h3>' + 
                                      '<p style="color: white;">Visit <a href="https://get.webgl.org/" target="_blank" style="color: white;">get.webgl.org</a> for more informaiton.</p>'
                            };
                reject(error);
            } else {
                resolve(true);
            }
        });
    }

    initialize() {
        return Promise.all([
            this.getNatureFromURL((this.initObj.natureURL) ? this.initObj.natureURL : "./resources/nature.json", this.initObj.naturePassphrase)
        ])
        .then((result) => {
            this.nature = result[0];

            return this.completeInitialization();
        })
        .catch(error => {
            console.error(error);
        });
    }

    completeInitialization() {
        return new Promise((resolve, reject) => {

            if (document.getElementById('loader')) {
                document.body.removeChild(document.getElementById('loader'));
            }

            if (this.initObj.authRequired === 'true') {
                this.authenticate().then((result) => {
                    resolve(result);
                });
            } else {
                resolve(true);
            }

        });
    }

    authenticate() {
        return new Promise((resolve, reject) => {
            if (this.nature.VLabsREST) {
                console.log('REST API AUTHENTICATION ATTEMPT');

                var self = this;
                request(this.nature.VLabsREST + '/refresh', function (error, response, body) {
                    if (error) {
                        console.error(error);
                        self.showErrorMessage({message: '<h3 style="color: red;">Failed to connecto to REST API</h3>'});
                        resolve(false);
                    } else {
                        console.log('statusCode:', response && response.statusCode);
                        // console.log('body:', body);
                        self.authResult = JSON.parse(body);
                        console.log("AUTH", self.authResult);
                        if (!self.authResult.access_token) {
                            self.showErrorMessage({message: '<h3 style="color: yellow;">REST API authentication failed</h3>'});
                            resolve(false);
                        } else {
                            self.VLabRESTInfo();
                            resolve(true);
                        }
                    }
                });
            } else {
                console.log('No REST API defined in nature');
                resolve(true);
            }
        });
    }

    VLabRESTInfo() {
        var self = this;
        var infoURL = this.nature.VLabsREST + (this.nature.HCAlias ? '/helpclip/info/' + btoa(this.nature.HCAlias): '/vlab/info/' + btoa(this.nature.alias))
        request(infoURL, function (error, response, body) {
            if (error) {
                console.error(error);
            } else {
                self.VLabInfo = JSON.parse(body);
                console.log(self.VLabInfo);
            }
        });
    }

    setWebGLRenderer() {
        console.log('THREE.WebGLRenderer', THREE.REVISION);
        this.webGLContainer.style.display = 'none';

        window.onresize = this.resiezeWebGLContainer.bind(this);

        this.webGLRenderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance',
            precision: 'lowp',
            alpha: false,
            powerPreference: 'high-performance'
        });

        this.webGLRenderer.setClearColor(this.initObj.webGLRendererClearColor ? this.initObj.webGLRendererClearColor : 0x000000);
        this.webGLRenderer.setPixelRatio(1.0);

        // prevent logging
        if (this.initObj.prodMode === 'true') {
            this.webGLRenderer.context.getShaderInfoLog = function () { return '' };
            this.webGLRenderer.context.getProgramInfoLog = function () { return '' };
        }

        this.webGLContainer.appendChild(this.webGLRenderer.domElement);
        this.webGLRenderer.domElement.addEventListener('contextmenu', function(event) {
            if (event.button == 2) {
                event.preventDefault();
            }
        });

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
            this.rearrangeTakenObjects();
        }

        for (var webglcontainerResizedSubscriberName in this.webGLContainerEventsSubcribers.webglcontainerresized) {
            var subscriber = this.webGLContainerEventsSubcribers.webglcontainerresized[webglcontainerResizedSubscriberName];
            subscriber.callback.call(subscriber.instance, event);
        }
    }

    setProgressBar() {
        this.progressBar = new ProgressBar.Line(this.progressBarElement, {
            strokeWidth: 4,
            easing: 'easeInOut',
            duration: 50,
            color: '#79aca7',
            trailColor: '#eee',
            trailWidth: 0.25,
            svgStyle: { width: '100%', height: '100%' },
            text: {
                style: {
                    color: '#cffdff',
                    position: 'absolute',
                    right: '0',
                    top: '40px',
                    padding: 0,
                    margin: 0,
                    transform: null
                },
                autoStyleContainer: true
            },
            from: {color: '#B2EBF2'},
            to: {color: '#006064'},
            step: (state, bar) => {
                if (bar.value() < 1)
                {
                    bar.setText(this.progressBarPrependText + Math.round(bar.value() * 100) + ' %');
                } else {
                    bar.setText(this.progressBarPrependText);
                }
            }
        });
    }

    setDefaultCamera(defaultCamera) {
        if (defaultCamera) {
            this.defaultCamera = defaultCamera;
            if (!this.vLabScene.getObjectByName(defaultCamera.name)) {
                this.vLabScene.add(defaultCamera);
            }
            return;
        }

        if (this.nature.defaultSceneCameraName) {
            this.defaultCamera = this.vLabScene.getObjectByName(this.nature.defaultSceneCameraName);
        } else {
            this.defaultCamera = new THREE.PerspectiveCamera(70, this.webGLContainer.clientWidth / this.webGLContainer.clientHeight, (this.nature.cameraControls.minClip ? this.nature.cameraControls.minClip : 0.1), 25.0);
            this.defaultCamera.name = 'defaultCamera';
        }
        if (!this.defaultCameraInitialPosition) {
            this.defaultCameraInitialPosition = this.defaultCamera.position.clone();
        }
        if (this.nature.cameraControls.target) {
            this.nature.cameraControls.target = new THREE.Vector3(this.nature.cameraControls.target.x, this.nature.cameraControls.target.y, this.nature.cameraControls.target.z);
        }
        this.allowedSpaceMapObject = this.vLabScene.getObjectByName(this.nature.cameraControls.allowedSpaceMapObjectName);
        if (this.allowedSpaceMapObject) {
            var alowedSpaceMap = this.allowedSpaceMapObject.material.map;
            this.allowedSpaceMapObject.material = new THREE.MeshBasicMaterial({ 
                map: alowedSpaceMap,
                transparent: true,
                opacity: 0.0
            });
            this.allowedSpaceMapObject.material.needsUpdate = true;

            var alowedSpaceMapImage = this.allowedSpaceMapObject.material.map.image;
            this.allowedSpaceCanvas = document.createElement('canvas');
            this.allowedSpaceCanvas.id = this.name + 'AllowedSpaceMapCanvas';
            this.allowedSpaceCanvas.width = alowedSpaceMapImage.width;
            this.allowedSpaceCanvas.height = alowedSpaceMapImage.height;
            this.allowedSpaceCanvas.getContext('2d').drawImage(alowedSpaceMapImage, 0, 0, alowedSpaceMapImage.width, alowedSpaceMapImage.height);
        }
        var yPanDeltaUp = (this.nature.cameraControls.yPanDeltaUp) ? this.nature.cameraControls.yPanDeltaUp : 0.5;
        var yPanDeltaDown = (this.nature.cameraControls.yPanDeltaDown) ? this.nature.cameraControls.yPanDeltaDown : 0.5;
        this.yPanUp = this.defaultCameraInitialPosition.y + yPanDeltaUp;
        this.yPanDown = this.defaultCameraInitialPosition.y - yPanDeltaDown;

        // var cameraHelper = new THREE.CameraHelper( this.defaultCamera );
        // this.vLabScene.add( cameraHelper );
    }

    setVLabScene(vLabScene) {
        // console.log(vLabScene);
        // return;

        var self = this;
        vLabScene.traverse(function(object) {
            if (object instanceof THREE.Mesh) {
                if (object.userData.matrixAutoUpdate === "false") {
                    object.matrixAutoUpdate = false;
                    object.updateMatrix();
                }
                if (object.userData.initiallyInvisible === "true") {
                    object.visible = false;
                }
                object.castShadow = false;
                object.receiveShadow = false;
                self.vLabSceneMeshes.push(object);
            }
        });

        this.vLabScene = (vLabScene) ? vLabScene : new THREE.Scene();

        dispatchEvent(this.sceneCompleteEvent);
    }

    activate() {
        this.setWebGLRenderer();

        if (this.nature.showTHREEStats) {
            this.setTHREEStats();
        }

        this.webGLContainer.addEventListener("mousemove", this.onMouseMove.bind(this), false);
        this.webGLContainer.addEventListener("mousedown", this.onMouseDown.bind(this), false);
        this.webGLContainer.addEventListener("mouseup", this.onMouseUpWindow.bind(this), false);
        this.webGLContainer.addEventListener("touchstart", this.onTouchStart.bind(this), false);
        this.webGLContainer.addEventListener("touchend", this.onTouchEnd.bind(this), false);

        document.addEventListener("pointerlockchange", this.onPointerLockChanged.bind(this), false);
        document.addEventListener("mozpointerlockchange", this.onPointerLockChanged.bind(this), false);
        document.addEventListener("webkitpointerlockchange", this.onPointerLockChanged.bind(this), false);

        document.addEventListener("fullscreenchange", this.onFullscreenChanged.bind(this), false);
        document.addEventListener("mozfullscreenchange", this.onFullscreenChanged.bind(this), false);
        document.addEventListener("webkitfullscreenchange", this.onFullscreenChanged.bind(this), false);
        document.addEventListener("msfullscreenchange", this.onFullscreenChanged.bind(this), false);

        this.fullscreenButton.addEventListener("mouseup", this.toggleFullscreen.bind(this), false);
        this.resetViewButton.addEventListener("mouseup", this.resetView.bind(this), false);
        this.fullscreenButton.addEventListener("touchend", this.toggleFullscreen.bind(this), false);
        this.resetViewButton.addEventListener("touchend", this.resetView.bind(this), false);
        // this.webGLContainer.addEventListener("mouseup", this.onMouseUp.bind(this), false);

        this.setInteractiveObjects();
        this.setReponsiveObjects();
        this.setDefaultCamera();
        this.setDefaultLighting();
        this.setupCrosshair();
        this.setupSelectionHelpers();
        this.setManipulationControl();
        this.setupCircularMenu();
        this.prepareHelperAssets();

        this.fullscreenButton.style.display = 'block';
        this.resetViewButton.style.display = 'block';

        this.overlayContainer.style.display = 'none';
        this.progressBarElement.style.display = 'none';

        this.webGLContainer.style.display = 'block';
        this.resiezeWebGLContainer();

        this.initialized = true;
        this.paused = false;

        this.resetView();

        this.defaultAudioListener = new THREE.AudioListener();
        this.defaultCamera.add(this.defaultAudioListener);

        dispatchEvent(this.activatedEvent);
    }

    loadScene(loaderMessage) {
        this.setProgressBar();
        return new Promise((resolve, reject) => {
            let thisVLab = this;
            thisVLab.progressBarPrependText = (loaderMessage)? loaderMessage : "The world of VLab is loaded by ";
            if (this.nature.sceneJSONFile) {
                let loader = new THREE.ObjectLoader();
                if (thisVLab.initObj.crossOrigin) loader.setCrossOrigin(thisVLab.initObj.crossOrigin);
                loader.convertUpAxis = true;
                loader.load(this.nature.sceneJSONFile, 
                    // onLoad callback
                    function (vLabScene) {
                        resolve(vLabScene);
                        thisVLab.progressBarPrependText = "loading...";
                    },
                    // onProgress callback
                    function (bytes) {
                        let loadedRel = (bytes.loaded / bytes.total).toFixed(2);
                        console.info(thisVLab.nature.title + " scene " + (loadedRel * 100).toFixed(2) + "% loaded");
                        if (loadedRel == 1) {
                            thisVLab.progressBarPrependText = "Loading textures... ";
                        }

                        if (thisVLab.progressBar) {
                            thisVLab.progressBar.animate(loadedRel);
                        }
                    },
                    // onError callback
                    function (error) {
                        reject('An error happened while loading VLab scene', error);
                    });
            } else {
                reject("Scene File is missing in VLab  nature :~( <br/> VLab title: [" + this.nature.title + "]" + "<br/>VLab nature file: [" + this.nature.sceneJSONFile + "]");
            }
        });
    }

    loadVLabItem(itemURL, vlabItemName) {
        return new Promise((resolve, reject) => {
            let thisVLab = this;
            this.overlayContainer.style.display = 'block';
            this.progressBarElement.style.display = 'block';
            thisVLab.progressBarPrependText = (vlabItemName)? "VLab Item [" + vlabItemName + "] is loaded by " : "VLab item is loaded by ";
            if (itemURL) {
                let loader = new THREE.ObjectLoader();
                loader.convertUpAxis = true;
                loader.load(itemURL, 
                    // onLoad callback
                    function (vLabItem) {
                        resolve(vLabItem);
                        thisVLab.overlayContainer.style.display = 'none';
                        thisVLab.progressBarElement.style.display = 'none';
                        thisVLab.progressBarPrependText = "loading...";
                    },
                    // onProgress callback
                    function (bytes) {
                        let loadedRel = (bytes.loaded / bytes.total).toFixed(2);
                        console.info("VLab Item" + ((vlabItemName) ? (" [" + vlabItemName) + "] " : " ") + (loadedRel * 100).toFixed(2) + "% loaded");
                        if (loadedRel == 1) {
                            thisVLab.progressBarPrependText = "Loading textures... ";
                        }

                        if (thisVLab.progressBarElement) {
                            thisVLab.progressBar.animate(loadedRel);
                        }
                    },
                    // onError callback
                    function (error) {
                        reject('An error happened while loading VLab Item', error);
                    });
            } else {
                reject("VLab Item File is missing!");
            }
        });
    }

    getNatureFromURL(url, passphrase) {
        return HTTPUtils.getJSONFromURL(url, passphrase.length > 0 ? passphrase : undefined);
    }

    render(time) {
        if (this.initialized && !this.paused) {

            if (this.statsTHREE) this.statsTHREE.begin();

            this.webGLRenderer.clear();

            this.webGLRenderer.render(this.vLabScene, this.defaultCamera);

            if (this.statsTHREE) this.statsTHREE.end();

            this.updateCameraControlsCheckIntersections();

            TWEEN.update(time);

            dispatchEvent(this.redererFrameEvent);

            for (var renderFrameEventSubscriberName in this.webGLContainerEventsSubcribers.renderframe) {
                var subscriber = this.webGLContainerEventsSubcribers.renderframe[renderFrameEventSubscriberName];
                var event = {};
                event.clockDelta = this.clock.getDelta();
                event.curTime = time;
                subscriber.callback.call(subscriber.instance, event);
            }

            requestAnimationFrame(this.render.bind(this));
        } else {

            setTimeout(this.render.bind(this), 250);
        }
    }

    onMouseMove(event) {
        this.mouseCoords.set(event.x, event.y);
        this.mouseCoordsRaycaster.set((event.x / this.webGLContainer.clientWidth) * 2 - 1, 1 - (event.y / this.webGLContainer.clientHeight) * 2);
        this.defaultCameraControls.active = true;

        for (var mouseMoveEventSubscriberName in this.webGLContainerEventsSubcribers.mousemove) {
            var subscriber = this.webGLContainerEventsSubcribers.mousemove[mouseMoveEventSubscriberName];
            subscriber.callback.call(subscriber.instance, event);
        }
    }

    onMouseDown(event) {
        this.mouseCoords.set(event.x, event.y);
        this.mouseCoordsRaycaster.set((event.x / this.webGLContainer.clientWidth) * 2 - 1, 1 - (event.y / this.webGLContainer.clientHeight) * 2);
        this.toggleSelectedObject();
        this.executeActions();

        for (var mouseDownEventSubscriberName in this.webGLContainerEventsSubcribers.mousedown) {
            var subscriber = this.webGLContainerEventsSubcribers.mousedown[mouseDownEventSubscriberName];
            subscriber.callback.call(subscriber.instance, event);
        }
    }

    onMouseUpWindow(event) {
        if (this.defaultCameraControls.type === 'pointerlock') {
            this.mouseCoords.set(event.clientX, event.clientY);
            this.mouseCoordsRaycaster.set((event.clientX / this.webGLContainer.clientWidth) * 2 - 1, 1 - (event.clientY / this.webGLContainer.clientHeight) * 2);
            this.toggleSelectedObject();
            if (this.selectedObject) {
                if (this.selectedObject == this.hoveredObject) {
                    if (this.nature.objectMenus[this.selectedObject.name]) {
                        if (this.nature.objectMenus[this.selectedObject.name][this.nature.lang]) {
                            this.switchCameraControls({ type: 'orbit', 
                                                        targetPos: this.defaultCameraControls.getObject().position,
                                                        targetObjectName: this.selectedObject.name });
                            this.webGLContainer.style.cursor = 'none';
                            this.showObjectSpecificCircularMenu();
                        }
                    }
                }
            }
            return;
        }
        if (this.defaultCameraControls.type === 'orbit') {
            this.helpersTrigger();
        }

        for (var mouseUpEventSubscriberName in this.webGLContainerEventsSubcribers.mouseup) {
            var subscriber = this.webGLContainerEventsSubcribers.mouseup[mouseUpEventSubscriberName];
            subscriber.callback.call(subscriber.instance, event);
        }
    }

    onTouchStart(event) {
        this.touchDevice = true;
        this.touching = true;
        event.preventDefault();
        this.mouseCoords.set(event.touches[0].clientX, event.touches[0].clientY);
        this.mouseCoordsRaycaster.set((event.touches[0].clientX / this.webGLContainer.clientWidth) * 2 - 1, 1 - (event.touches[0].clientY / this.webGLContainer.clientHeight) * 2);

        for (var touchStartEventSubscriberName in this.webGLContainerEventsSubcribers.touchstart) {
            var subscriber = this.webGLContainerEventsSubcribers.touchstart[touchStartEventSubscriberName];
            subscriber.callback.call(subscriber.instance, event);
        }
    }

    onTouchEnd(event) {
        this.touching = false;
        event.preventDefault();
        this.executeActions(true);
        this.toggleSelectedObject(true);
        this.helpersTrigger();

        for (var touchEndEventSubscriberName in this.webGLContainerEventsSubcribers.touchend) {
            var subscriber = this.webGLContainerEventsSubcribers.touchend[touchEndEventSubscriberName];
            subscriber.callback.call(subscriber.instance, event);
        }
    }

    onPointerLockChanged(event) {
        if (!document.pointerLockElement) {
            if (this.defaultCameraControls.getObject) {
                var curPos = this.defaultCameraControls.getObject().position.clone();
                this.switchCameraControls({ type: 'orbit', 
                                            targetPos: curPos,
                                            target: new THREE.Vector3() });
            }
        }
    }

    onFullscreenChanged() {
        var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
        if(!fullscreenElement) {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            this.fullscreenButton.style.backgroundImage = "url('../vlabs.assets/img/fullscreen.png')";
        }
    }

    setInteractiveObjects(except) {
        this.interactiveObjects = [];
        if (!this.nature.interactiveObjects) return;
        for (var interactiveObjectName of this.nature.interactiveObjects) {
            if ((Array.isArray(except) && !except.includes(interactiveObjectName)) || (!Array.isArray(except) && except !== interactiveObjectName)) {
                var object = this.vLabScene.getObjectByName(interactiveObjectName);
                if (object) {
                    this.interactiveObjects.push(object);
                }
            }
        }
        this.nature.interactiveObjects = [];
        for (var interactiveObject of this.interactiveObjects) {
            this.nature.interactiveObjects.push(interactiveObject.name);
        }
        //interactive suppressors
        this.interactivesSuppressorsObjects = [];
        if (this.nature.interactivesSuppressorsObjects) {
            for (var interactivesSuppressorObjectName of this.nature.interactivesSuppressorsObjects) {
                var interactivesSuppressorsObject = this.vLabScene.getObjectByName(interactivesSuppressorObjectName);
                if (interactivesSuppressorsObject) {
                    this.interactivesSuppressorsObjects.push(interactivesSuppressorsObject);
                } else {
                    console.error(interactivesSuppressorObjectName + "interactive suppressor Object is undefined");
                }
            }
        }
    }

    setReponsiveObjects(except) {
        this.responosiveObjects = [];
        if (!this.nature.responsiveObjects) return;
        for (var responsiveObjectName of this.nature.responsiveObjects) {
            if ((Array.isArray(except) && !except.includes(responsiveObjectName)) || (!Array.isArray(except) && except !== responsiveObjectName)) {
                this.responosiveObjects.push(this.vLabScene.getObjectByName(responsiveObjectName));
            }
        }
        this.nature.responsiveObjects = [];
        for (var responsiveObject of this.responosiveObjects) {
            this.nature.responsiveObjects.push(responsiveObject.name);
        }
    }

    switchCameraControls(cameraControlConfig) {
        if (this.defaultCameraControls) {
            if (this.defaultCameraControls.type) {

                if (this.defaultCameraControls.type == cameraControlConfig.type && !cameraControlConfig.forced) {
                    return;
                }

                if (cameraControlConfig.type == 'pointerlock' && this.defaultCameraControls.type != 'pointerlock') {
                    var center = new THREE.Vector2(this.webGLContainer.clientWidth / 2, this.webGLContainer.clientHeight / 2);
                    if (this.mouseCoords.distanceTo(center) > 5) {
                        iziToast.warning({
                            title: 'Caution',
                            message: 'Place mouse pointer closer to the center to request Pointer Lock. Distance = ' + this.mouseCoords.distanceTo(center).toFixed(1),
                            timeout: 2500
                        });
                        this.crosshair.scale.set(0.2, 0.2, 0.2);
                        this.crosshair.visible = true;
                        if (this.crosshairHelper) clearTimeout(this.crosshairHelper);
                        this.crosshairHelper = setTimeout(() => { this.crosshair.visible = false; }, 2500 );
                        return;
                    }
                    if (this.crosshairHelper) clearTimeout(this.crosshairHelper);
                }
            }
            this.defaultCameraControls.dispose();
        }


        switch (cameraControlConfig.type) {
            case 'orbit':
                if (this.defaultCameraControls) {
                    if (this.defaultCameraControls.type == 'pointerlock') {
                        this.vLabScene.remove(this.vLabScene.getObjectByName("CameraPitchObject"));
                        this.vLabScene.remove(this.vLabScene.getObjectByName("CameraYawObject"));
                        this.setDefaultCamera(this.defaultCamera);
                    }
                }
                this.crosshair.visible = false;
                var initialPos = undefined;
                if (cameraControlConfig.targetPos) {
                    initialPos = cameraControlConfig.targetPos.clone();
                }

                if (cameraControlConfig.initialZoom) {
                    this.defaultCamera.zoom = cameraControlConfig.initialZoom;
                }

                this.defaultCameraControls = new OrbitControls(this.defaultCamera, this.webGLContainer, initialPos);
                if (cameraControlConfig.target) {
                    this.defaultCameraControls.target = cameraControlConfig.target;
                    this.defaultCameraControls.target0 = this.defaultCameraControls.target.clone();
                }
                if (cameraControlConfig.targetObjectName) {
                    this.defaultCameraControls.target = this.vLabScene.getObjectByName(cameraControlConfig.targetObjectName).position.clone();
                }
                if (this.nature.cameraControls.maxDistance !== undefined) {
                    this.defaultCameraControls.maxDistance = this.nature.cameraControls.maxDistance;
                }
                if (this.nature.cameraControls.minDistance !== undefined) {
                    this.defaultCameraControls.minDistance = this.nature.cameraControls.minDistance;
                }
                if (this.nature.cameraControls.maxPolarAngle !== undefined) {
                    this.defaultCameraControls.maxPolarAngle = this.nature.cameraControls.maxPolarAngle;
                }
                if (this.nature.cameraControls.minPolarAngle !== undefined) {
                    this.defaultCameraControls.minPolarAngle = this.nature.cameraControls.minPolarAngle;
                }
                if (this.nature.cameraControls.position0 !== undefined) {
                    this.defaultCameraControls.position0 = this.nature.cameraControls.position0;
                }
                if (this.nature.cameraControls.enablePan !== undefined) {
                    this.defaultCameraControls.enablePan = this.nature.cameraControls.enablePan;
                }

                //override with cameraControlConfig from argument
                if (cameraControlConfig.maxDistance) {
                    this.defaultCameraControls.maxDistance = cameraControlConfig.maxDistance;
                }
                if (cameraControlConfig.minDistance) {
                    this.defaultCameraControls.minDistance = cameraControlConfig.minDistance;
                }

                if (cameraControlConfig.forced) {
                    this.defaultCameraControls.reset();
                }
                this.defaultCameraControls.update();

            break;
            case 'pointerlock':
                if (this.defaultCameraControls) {
                    if (this.defaultCameraControls.type == 'orbit') {
                        this.defaultCamera.position.y = this.defaultCameraInitialPosition.y;
                    }
                }
                this.defaultCameraControls = new PointerLockControls(this.defaultCamera, this.vLabScene);
                this.crosshair.visible = true;
                this.defaultCameraControls.update();
                this.defaultCameraControls.requestPointerLock();
            break;
            case 'assistant':
            break;
        }
        this.defaultCameraControls.type = cameraControlConfig.type;
        this.defaultCameraControls.enabled = true;
        this.tooltipHide();
    }

    updateCameraControlsCheckIntersections() {

        if (this.touchDevice === true) {
            if (this.touching !== true) {
                return;
            }
        }

        var interactionObjectIntersects = [];

        var interactiveObjectsWithInteractiveSuppressors = this.interactiveObjects.concat(this.interactivesSuppressorsObjects);

        if (this.defaultCameraControls.type === 'pointerlock') {
            this.defaultCameraControls.update();
            if (this.defaultCameraControls.active) {
                this.iteractionRaycaster.setFromCamera({x: 0, y: 0}, this.defaultCamera);
                interactionObjectIntersects = this.iteractionRaycaster.intersectObjects(interactiveObjectsWithInteractiveSuppressors);
            }
        } else if (this.defaultCameraControls.type === 'orbit') {
            if (this.defaultCameraControls.active) {
                this.iteractionRaycaster.setFromCamera(this.mouseCoordsRaycaster, this.defaultCamera);
                interactionObjectIntersects = this.iteractionRaycaster.intersectObjects(interactiveObjectsWithInteractiveSuppressors);
            }
        }

        if (this.defaultCameraControls.active) {
            if (interactionObjectIntersects.length > 0) {

                if (this.interactivesSuppressorsObjects.indexOf(interactionObjectIntersects[0].object) == -1) {

                    if (interactionObjectIntersects[0].object !== this.hoveredObject && this.hoveredObject != this.selectedObject) {
                        if (this.selectionHelper) this.selectionHelper.visible = false;
                    }

                    if (this.hoveredResponsiveObject) {
                        this.hoveredResponsiveObject.material.emissive = new THREE.Color(0, 0, 0);
                        this.hoveredResponsiveObject = undefined;
                        this.tooltipHide();
                    }

                    this.tooltipShow(interactionObjectIntersects[0].object);
                    this.hoveredObject = interactionObjectIntersects[0].object;
                    this.webGLContainer.style.cursor = 'pointer';
                    this.selectionHelper = this.vLabScene.getObjectByName(interactionObjectIntersects[0].object.name + "_SELECTION");
                    if (this.selectionHelper) {
                        this.selectionHelper.visible = true;
                    }

                    this.defaultCameraControls.active = false;
                    return;
                } else {
                    this.hoveredObject = undefined;
                }

            } else {
                if (this.selectionHelper) {
                    if (this.hoveredObject !== this.selectedObject) {
                        this.clearNotSelected();
                    }
                    this.selectionHelper = undefined;
                    this.cMenu.hide();
                }
                if (this.hoveredObject) {
                    this.hoveredObject = undefined;
                }
                if (!this.cursorPointerControlFromVLabItem) {
                    this.webGLContainer.style.cursor = 'auto';
                } else {
                    this.cursorPointerControlFromVLabItem = false;
                }
            }

            if (this.selectedObject) {
                if (this.takenObjects[this.selectedObject.name]) {
                    var responsiveObjectsItersects = undefined;

                    this.responsiveRaycaster.setFromCamera(this.mouseCoordsRaycaster, this.defaultCamera);

                    var responsiveObjectsWithInteractiveSuppressors = this.responosiveObjects.concat(this.interactivesSuppressorsObjects);

                    responsiveObjectsItersects = this.responsiveRaycaster.intersectObjects(responsiveObjectsWithInteractiveSuppressors);

                    if (responsiveObjectsItersects.length > 0) {
                        if (this.hoveredResponsiveObject) {
                            this.hoveredResponsiveObject.material.emissive = new THREE.Color(0, 0, 0);
                            this.hoveredResponsiveObject = undefined;
                            this.tooltipHide();
                        }

                        if (this.interactivesSuppressorsObjects.indexOf(responsiveObjectsItersects[0].object) == -1) {
                            if (this.nature.interactions[this.selectedObject.name + "|" + responsiveObjectsItersects[0].object.name]) {
                                this.tooltipShow(responsiveObjectsItersects[0].object);
                                this.hoveredResponsiveObject = responsiveObjectsItersects[0].object;
                                this.hoveredResponsiveObject.intersectionPoint = responsiveObjectsItersects[0].point;
                                this.hoveredResponsiveObject.material.emissive = new THREE.Color(0.0, 0.2, 0.0);
                            }
                        }
                    }
                }
            } else {
                if (this.hoveredResponsiveObject) {
                    this.hoveredResponsiveObject.material.emissive = new THREE.Color(0, 0, 0);
                    this.hoveredResponsiveObject = undefined;
                }
            }

            //Is in allowed space check
            if (this.allowedSpaceMapObject && this.defaultCameraControls.enabled && !this.zoomMode) {
                if (this.defaultCameraControls.type === 'orbit') {
                    this.allowedSpaceRaycaster.set(this.defaultCamera.position, new THREE.Vector3(0, -1, 0));
                }
                if (this.defaultCameraControls.type === 'pointerlock') {
                    this.allowedSpaceRaycaster.set(this.defaultCameraControls.getObject().position, new THREE.Vector3(0, -1, 0));
                }
                var allowedSpaceIntersections = this.allowedSpaceRaycaster.intersectObject(this.allowedSpaceMapObject, true);
                var allowed = false;
                if (allowedSpaceIntersections[0]) {
                    var uv = allowedSpaceIntersections[0].uv;
                    var pixelData = this.allowedSpaceCanvas.getContext('2d').getImageData(511 * uv.x, 512 - 511 * uv.y, 1, 1).data;
                    if (pixelData[1] == 255) allowed = true;
                    if (this.defaultCameraControls.type === 'orbit') {
                        if (this.defaultCamera.position.y > this.yPanUp || this.defaultCamera.position.y < this.yPanDown) {
                            allowed = false;
                        }
                    }
                }
                if (allowed) {
                    if (this.defaultCameraControls.type === 'orbit') {
                        this.prevAllowedCameraControlPosition = this.defaultCamera.position.clone();
                    }
                    if (this.defaultCameraControls.type === 'pointerlock') {
                        this.prevAllowedCameraControlPosition =  this.defaultCameraControls.getObject().position.clone();
                    }
                } else {
                    this.defaultCameraControls.enabled = false;
                    if (this.defaultCameraControls.type === 'orbit') {
                        this.defaultCamera.position.copy(this.prevAllowedCameraControlPosition);
                    }
                    if (this.defaultCameraControls.type === 'pointerlock') {
                        this.defaultCameraControls.getObject().position.copy(this.prevAllowedCameraControlPosition);
                    }
                    this.defaultCameraControls.enabled = true;
                }
            }

            this.defaultCameraControls.active = false;
        }

        if (this.touchDevice === true) {
            this.takenToResponsiveArrowUpdate();
        }
    }

    toggleSelectedObject(touch = false) {
        if (this.hoveredObject) {
            if (!touch || (touch && this.hoveredObject == this.preSelectedObject)) {
                this.selectedObject = this.hoveredObject;
                this.cMenu.hide();
                this.selectionHelper = this.vLabScene.getObjectByName(this.selectedObject.name + "_SELECTION");
                if (this.selectionHelper) this.selectionHelper.material.color = new THREE.Color(0, 1, 1);

                if (this.hoveredResponsiveObject) {
                    this.hoveredResponsiveObject.material.emissive = new THREE.Color(0, 0, 0);
                    this.hoveredResponsiveObject = undefined;
                }

                if (this.nature.objectMenus) {
                    if (this.nature.objectMenus[this.selectedObject.name])
                    {
                        if (this.nature.objectMenus[this.selectedObject.name][this.nature.lang]) {
                            if (this.selectionHelper) this.selectionHelper.material.color = new THREE.Color(0, 1, 0);
                        }
                    }
                }

                if (!this.takenObjects[this.selectedObject.name]) {
                    if (this.defaultCameraControls.type == 'orbit') {
                        if (this.selectedObject == this.preSelectedObject) {
                            new TWEEN.Tween(this.defaultCameraControls.target)
                            .to({ x: this.selectedObject.position.x, z: this.selectedObject.position.z }, 500)
                            .easing(TWEEN.Easing.Cubic.InOut)
                            .onUpdate(() => { 
                                this.defaultCameraControls.update();
                                this.tooltipHide();
                            })
                            .onComplete(() => { 
                                if (!touch) {
                                    setTimeout(()=>{
                                        this.showObjectSpecificCircularMenu();
                                    }, 500);
                                } else {
                                    if (this.selectedObject) {
                                        if (this.selectedObject == this.hoveredObject) {
                                            setTimeout(()=>{
                                                this.showObjectSpecificCircularMenu();
                                            }, 500);
                                            this.tooltipHide();
                                        }
                                    }
                                }
                             })
                            .start();
                        }
                    }
                } else {
                    this.tooltipHide();
                }
            }
        } else {
            if(performance.now() - this.prevSelectionTime < 250) {
                this.resetAllSelections();
            }
        }
        this.preSelectedObject = this.hoveredObject;
        this.prevSelectionTime = performance.now();
        this.clearNotSelected();
    }

    resetAllSelections() {
        for (var interactiveObject of this.interactiveObjects) {
            var selectionSphere = this.vLabScene.getObjectByName(interactiveObject.name + "_SELECTION");
            if (selectionSphere) {
                selectionSphere.visible = false;
                selectionSphere.material.color = new THREE.Color(1, 1, 0);
            }
        }
        this.selectedObject = undefined;
        this.preSelectedObject = undefined;
        this.tooltipHide();
        this.cMenu.hide();
    }

    clearNotSelected() {
        for (var interactiveObject of this.interactiveObjects) {
            if (this.selectedObject != interactiveObject) {
                var selectionSphere = this.vLabScene.getObjectByName(interactiveObject.name + "_SELECTION");
                if (selectionSphere) {
                    selectionSphere.visible = false;
                    selectionSphere.material.color = new THREE.Color(1, 1, 0);
                }
            }
        }
        this.tooltipHide();
    }

    setDefaultLighting() {
        this.ambientLight = new THREE.AmbientLight(0x111111);
        this.ambientLight.intensity = 3.0;
        this.ambientLight.defaultSettings = {color: new THREE.Color(0x111111), intensity: 3.0};
        this.ambientLight.name = 'ambientLight';
        this.vLabScene.add(this.ambientLight);
    }

    setupCrosshair() {
        var crosshairSpriteMap = [];
        crosshairSpriteMap[0] = new THREE.TextureLoader().load('../vlabs.assets/img/crosshair.png');
        var crosshairSpriteMaterial = new THREE.SpriteMaterial({ map: crosshairSpriteMap[0] });
        this.crosshair = new THREE.Sprite(crosshairSpriteMaterial);

        this.crosshair.position.set(0, 0, -0.25);
        this.crosshair.scale.set(0.01, 0.01, 1.0);
        this.crosshair.visible = true;

        this.crosshairPulsation = new TWEEN.Tween(this.crosshair.scale)
        .to({x: 0.02, y: 0.02}, 500)
        .repeat(Infinity)
        .yoyo(true)
        .easing(TWEEN.Easing.Quadratic.InOut).start();


        this.defaultCamera.add(this.crosshair);
    }

    getWorldPosition(obj) {
        var worldPosition = new THREE.Vector3();

        obj.updateMatrixWorld();
        worldPosition.setFromMatrixPosition(obj.matrixWorld);

        return worldPosition;
    }

    toScreenPosition(obj) {
        var vector = new THREE.Vector3();

        var widthHalf = 0.5 * this.webGLContainer.clientWidth;
        var heightHalf = 0.5 * this.webGLContainer.clientHeight;

        obj.updateMatrixWorld();
        vector.setFromMatrixPosition(obj.matrixWorld);
        vector.project(this.defaultCamera);

        vector.x = (vector.x * widthHalf) + widthHalf;
        vector.y = -(vector.y * heightHalf) + heightHalf;

        return {
            x: vector.x,
            y: vector.y
        };
    };

    setupSelectionHelpers() {
        for (var interactiveObject of this.interactiveObjects) {
            this.addSelectionHelperToObject(interactiveObject);
        }
    }

    addSelectionHelperToObject(interactiveObject) {
        var selectionHelper = undefined;
        var canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        var ctx = canvas.getContext("2d");
        if (!this.nature.advancedSelectionHelper) {
            var gradient = ctx.createLinearGradient(0, 0, 0, 128);
            gradient.addColorStop(0.35, "black");
            gradient.addColorStop(0.475, "white");
            gradient.addColorStop(0.65, "black");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 128, 128);
            var selectionAlphaTexture = new THREE.Texture(canvas);
            selectionAlphaTexture.needsUpdate = true;
            interactiveObject.geometry.computeBoundingSphere();
            var sphereGeom = new THREE.SphereGeometry(interactiveObject.geometry.boundingSphere.radius, 12, 8);
            sphereGeom.rotateX(1.57);
            var sphereMat = new THREE.MeshBasicMaterial({
              color: new THREE.Color(1, 1, 0), // yellow ring
              transparent: true,
              opacity: 0.75,
              alphaMap: selectionAlphaTexture,
              depthTest: false,
              depthWrite: true
            });
            var selectionHelper = new THREE.Mesh(sphereGeom, sphereMat);
            selectionHelper.position.copy(interactiveObject.geometry.boundingSphere.center.clone());
            interactiveObject.add(selectionHelper);

            new TWEEN.Tween(selectionHelper.scale)
            .to({x: 1.2, y: 1.2}, 500)
            .repeat(Infinity)
            .yoyo(true)
            .easing(TWEEN.Easing.Quadratic.InOut).start();
        } else {
            var outlineMaterial = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                side: THREE.BackSide,
                transparent: true,
                opacity: 0.65,
                blending: THREE.AdditiveBlending,
                depthTest: true,
                depthWrite: true
            });

            selectionHelper = new THREE.Mesh(interactiveObject.geometry, outlineMaterial);
            interactiveObject.geometry.computeBoundingSphere();
            selectionHelper.scale.multiplyScalar(1.0 + 0.01 * (1.0 / interactiveObject.geometry.boundingSphere.radius));

            new TWEEN.Tween(selectionHelper.material)
            .to({opacity: 0.1}, 750)
            .repeat(Infinity)
            .yoyo(true)
            .easing(TWEEN.Easing.Quadratic.InOut).start();
        }

        selectionHelper.name = interactiveObject.name + "_SELECTION";
        selectionHelper.visible = false;
        interactiveObject.add(selectionHelper);
    }

    setManipulationControl() {
        this.manipulationControl = new TransformControls(this.defaultCamera, this.webGLRenderer.domElement);
        this.manipulationControl.setSize(1.0);
        this.vLabScene.add(this.manipulationControl);
    }

    setupCircularMenu() {
        this.cMenu = CMenu(this.cMenuElement);
        this.cMenu.setContext(this);
    }

    showObjectSpecificCircularMenu(configObj) {
        if (!this.selectedObject) {
            return;
        }
        if (this.nature.objectMenus[this.selectedObject.name]) {
            this.cMenuElement.innerHTML = "";
            if (this.nature.objectMenus[this.selectedObject.name][this.nature.lang]) {
                this.cMenu.config({
                    menus: this.nature.objectMenus[this.selectedObject.name][this.nature.lang]
                });

                var screenPos = this.toScreenPosition(this.selectedObject);
                var cMenuPos = { x: screenPos.x, y: screenPos.y };
                if (configObj) {
                    if (configObj['positionDeltas']) {
                        cMenuPos.x += configObj['positionDeltas'].x;
                        cMenuPos.y += configObj['positionDeltas'].y;
                    }
                }
                if (cMenuPos.x + 150 > this.webGLContainer.clientWidth) {
                    cMenuPos.x -= cMenuPos.x + 150 - this.webGLContainer.clientWidth;
                }
                if (cMenuPos.x - 150 < 0) {
                    cMenuPos.x += 150 - cMenuPos.x;
                }
                if (cMenuPos.y - 150 < 0) {
                    cMenuPos.y += 150 - cMenuPos.y;
                }
                this.cMenu.show([cMenuPos.x, cMenuPos.y]);

                this.defaultCameraControls.enabled = false;
                // this.paused = true;
            }
        }
    }

    tooltipShow(obj) {
        if (this.nature.tooltips === undefined) return;

        if (obj.userData.tooltipShown === undefined) obj.userData.tooltipShown = 0;
        if (this.nature.tooltips[obj.name] && (obj.userData.tooltipShown <= this.nature.tooltips[obj.name].timesToShow || !this.nature.tooltips[obj.name].timesToShow)) {
            var screenPos = this.toScreenPosition(obj);
            this.tooltipPlacer.innerText = this.nature.tooltips[obj.name][this.nature.lang];
            this.tooltipPlacer.style.left = screenPos.x + 'px';
            this.tooltipPlacer.style.top = screenPos.y + 25 + 'px';
            this.tooltipPlacer.style.display = 'block';
            if (obj !== this.hoveredObject)
                obj.userData.tooltipShown++;
        } else {
            this.tooltipHide();
        }
    }

    tooltipHide() {
        this.tooltipPlacer.innerText = "";
        this.tooltipPlacer.style.left = '0px';
        this.tooltipPlacer.style.top = '0px';
        this.tooltipPlacer.style.display = 'none';
    }

    setTHREEStats() {
        this.statsTHREE = new THREEStats();
        this.statsTHREE.domElement.style.position = 'absolute';
        this.statsTHREE.domElement.style.left = '0px';
        this.statsTHREE.domElement.style.top = '0px';
        document.body.appendChild(this.statsTHREE.domElement);
    }

    toggleFullscreen() {
        this.paused = true;
        setTimeout(() => { this.paused = false; }, 750);
        var element = document.body;
        var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
        if (!fullscreenElement) {
            if(element.requestFullscreen) {
                element.requestFullscreen();
            } else if(element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if(element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen();
            } else if(element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
            this.cMenu.hide();
            this.fullscreenButton.style.backgroundImage = "url('../vlabs.assets/img/fullscreen-exit.png')";
        } else {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            this.fullscreenButton.style.backgroundImage = "url('../vlabs.assets/img/fullscreen.png')";
        }
    }

    resetView() {
        var targetPos = new THREE.Vector3(0.0, 0.0, 0.0);
        if (this.nature.cameraControls.targetObjectName) {
            targetPos = this.vLabScene.getObjectByName(this.nature.cameraControls.targetObjectName).position.clone();
        }
        if (this.nature.cameraControls.target) {
            targetPos = this.nature.cameraControls.target.clone();
        }
        this.switchCameraControls({ type: 'orbit', 
                                    forced: true,
                                    targetPos: this.defaultCameraInitialPosition.clone(),
                                    target:  targetPos });

        for (var resetViewSubscriberName in this.webGLContainerEventsSubcribers.resetview) {
            var subscriber = this.webGLContainerEventsSubcribers.resetview[resetViewSubscriberName];
            subscriber.callback.call(subscriber.instance, {});
        }

        this.zoomViewArea.style.display = 'none';
        this.zoomViewArea.style.opacity = 0.0;
    }

    prepareHelperAssets() {
        var textureLoader = new THREE.TextureLoader();
        return Promise.all([
            textureLoader.load(this.helpers.placeHelper.url),
        ])
        .then((result) => {
            this.helpers.placeHelper.texture = result[0];

            this.prepareHelpers();
        })
        .catch(error => {
            console.error(error);
        });
    }

    prepareHelpers() {
        this.takenObjectsToResponsiveObjectsArrow = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), new THREE.Color(0x00ff00));
        this.vLabScene.add(this.takenObjectsToResponsiveObjectsArrow);
        this.takenObjectsToResponsiveObjectsArrow.visible = false;

        var placeHelperMaterial = new THREE.SpriteMaterial({
            map: this.helpers.placeHelper.texture,
            color: 0xffffff,
            blending: THREE.NormalBlending
        });
        placeHelperMaterial.depthTest = false;
        placeHelperMaterial.depthWrite = false;
        this.helpers.placeHelper.sprite = new THREE.Sprite(placeHelperMaterial);
        this.helpers.placeHelper.sprite.scale.set(0.1, 0.1, 0.1);
        this.helpers.placeHelper.sprite.visible = false;
        this.vLabScene.add(this.helpers.placeHelper.sprite);
    }

    helpersTrigger() {

    }

    takeObjectToInventory(args) {
        // console.log(args);
        if (this.inventory) {

            var self = this;
            if (this.selectedObject.takenRotation) {
                this.selectedObject.takenRotation.stop();
            }
            // this.selectedObject.traverse(function(node) {
            //     if (node.type === "Mesh") {
            //         if (node.name !== self.selectedObject.name + "_SELECTION") {
            //             if (node.material.type === "MeshPhongMaterial") {
            //                 node.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
            //             }
            //             if (node.material.transparent) {
            //                 node.material.transparent = false;
            //                 node.material.opacity = 1.0;
            //             }
            //         } else {
            //             node.visible = false;
            //         }
            //     }
            // });

            this.selectedObject.rotationX = 0.0;
            this.selectedObject.rotationY = 0.0;
            this.selectedObject.rotationZ = 0.0;
            this.selectedObject.position.set(0.0, 0.0, 0.0);

            if (args) {
                if (args['resetscale']) {
                    this.selectedObject.scale.set(1.0, 1.0, 1.0);
                }
                if (args['resetquat']) {
                    this.selectedObject.quaternion.copy(args['resetquat']);
                }
            }

            this.inventory.addItem({
                item: this.selectedObject,
                initObj: this.selectedObject.userData["initObj"],
                vLabItem: this.selectedObject.userData["VLabItem"]
            });

            if (args) {
                if (args['callback']) {
                    args['callback'].call(this.selectedObject.userData["VLabItem"]);
                }
            }
        }
    }

    takeObject(args) {
        if(Object.keys(this.takenObjects).length > 2) {
            iziToast.info({
                title: 'Info',
                message: 'You can carry maximum 3 objects at once',
                timeout: 3000
            });
            return;
        }

        if (args) {
            if (args['resetscale']) {
                this.selectedObject.scale.set(1.0, 1.0, 1.0);
            }
            if (args['resetquat']) {
                this.selectedObject.quaternion.copy(args['resetquat']);
            }
        }

        // this.selectedObject.traverse(function(node) {
        //     if (node.type === "Mesh") {
        //         // if (node.material.type === "MeshPhongMaterial") {
        //         //     node.material.emissive = new THREE.Color(0.5, 0.5, 0.5);
        //         // }
        //         if (!node.material.transparent) {
        //             node.material.transparent = true;
        //             node.material.opacity = 0.85;
        //         }
        //     }
        // });
        var cameraAspectOffset = 0.075 / this.defaultCamera.aspect;
        this.selectedObject.beforeTakenRotation = this.selectedObject.rotation.clone();
        this.selectedObject.rotation.x = -0.75;
        this.selectedObject.rotation.y = -0.1;
        this.selectedObject.geometry.computeBoundingSphere();
        this.selectedObject.position.set(0.18 - cameraAspectOffset, 0.075 - Object.keys(this.takenObjects).length / 15, -0.2);
        this.selectedObject.scale.multiplyScalar(0.02 / this.selectedObject.geometry.boundingSphere.radius);
        this.selectedObject.takenRotation = new TWEEN.Tween(this.selectedObject.rotation)
        .to({z: Math.PI}, 40000)
        .repeat(Infinity)
        .yoyo(true)
        .easing(TWEEN.Easing.Quadratic.InOut).start();
        if (args) {
            if (args['callback']) {
                if (this.selectedObject.userData["VLabItem"]) {
                    args['callback'].call(this.selectedObject.userData["VLabItem"]);
                }
            }
        }
        this.takenObjects[this.selectedObject.name] = this.selectedObject;
        this.defaultCamera.remove(this.selectedObject);
        this.defaultCamera.add(this.selectedObject);
        this.resetAllSelections();
        this.rearrangeTakenObjects();
    }

    rearrangeTakenObjects() {
        var cameraAspectOffset = 0.075 / this.defaultCamera.aspect;
        var i = 0;
        for (var takenObjectName in this.takenObjects) {
            var takenObject = this.takenObjects[takenObjectName];
            takenObject.position.set(0.18 - cameraAspectOffset, 0.075 - i / 15, -0.2);
            i++;
        }
    }

    takeOffObject(resetToBeforeTakenState) {
        if (!this.selectedObject) {
            return;
        }
        var self = this;
        this.selectedObject.takenRotation.stop();
        // this.selectedObject.traverse(function(node) {
        //     if (node.type === "Mesh") {
        //         if (node.name !== self.selectedObject.name + "_SELECTION") {
        //             // if (node.material.type === "MeshPhongMaterial") {
        //             //     node.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
        //             // }
        //             if (node.material.transparent) {
        //                 node.material.transparent = false;
        //                 node.material.opacity = 1.0;
        //             }
        //         }
        //     }
        // });
        this.defaultCamera.remove(this.selectedObject);
        this.takenObjects[this.selectedObject.name] = undefined;
        delete this.takenObjects[this.selectedObject.name];
        this.rearrangeTakenObjects();
        this.selectedObject.scale.set(1.0, 1.0, 1.0);
        if (resetToBeforeTakenState) {
            this.selectedObject.rotation.copy(this.selectedObject.beforeTakenRotation);
        } else {
            this.selectedObject.rotation.set(0.0, 0.0, 0.0);
        }
        var takenObject = this.selectedObject;
        this.vLabScene.add(this.selectedObject);
        this.resetAllSelections();

        for (var takenObjectName in this.webGLContainerEventsSubcribers.takenobjectapplication) {
            var subscriber = this.webGLContainerEventsSubcribers.takenobjectapplication[takenObjectName];
            var event = {};
            event.takenObject = takenObject;
            subscriber.callback.call(subscriber.instance, event);
        }
    }

    takenToResponsiveArrowUpdate() {
        if (this.defaultCameraControls.type !== 'orbit' || !this.defaultCameraControls.staticMode || !this.selectedObject) {
            this.helpers.placeHelper.sprite.visible = false;
            this.takenObjectsToResponsiveObjectsArrow.visible = false;
            return;
        }

        if (this.hoveredResponsiveObject && Object.keys(this.takenObjects).length > 0 && this.takenObjects[this.selectedObject.name]) {
            if (this.nature.interactions[this.selectedObject.name + "|" + this.hoveredResponsiveObject.name]) 
            {
                var takenObjectPosition = this.getWorldPosition(this.takenObjects[this.selectedObject.name]);
                var hoveredResponsiveObjectDirection = this.hoveredResponsiveObject.intersectionPoint.clone().sub(takenObjectPosition.clone());
                var hoveredResponsiveObjectDirectionVectorLength = hoveredResponsiveObjectDirection.clone().length();
                hoveredResponsiveObjectDirection.normalize();
                this.takenObjectsToResponsiveObjectsArrow.visible = true;
                this.takenObjectsToResponsiveObjectsArrow.setColor(new THREE.Color(0x00ff00));
                this.takenObjectsToResponsiveObjectsArrow.position.copy(takenObjectPosition);
                this.takenObjectsToResponsiveObjectsArrow.setDirection(hoveredResponsiveObjectDirection);
                this.takenObjectsToResponsiveObjectsArrow.setLength(hoveredResponsiveObjectDirectionVectorLength, 0.001, 0.0001);
                this.helpers.placeHelper.sprite.position.copy(this.hoveredResponsiveObject.intersectionPoint);
                this.helpers.placeHelper.sprite.visible = true;
            } else {
                this.helpers.placeHelper.sprite.visible = false;
                this.takenObjectsToResponsiveObjectsArrow.visible = false;
            }
        } else {
            this.helpers.placeHelper.sprite.visible = false;
            this.takenObjectsToResponsiveObjectsArrow.visible = false;
        }
    }

    showInfo(value) {
        if (value.url) {
            popupS.ajax({
                title: value.title,
                ajax: {
                    url: value.url,
                }
            });
        } else  if (value.html) {
            popupS.modal({
                title:   value.title,
                content: {
                    html: value.html
                }
            });
        }
    }

    executeActions(touch) {
        if (this.defaultCameraControls.type !== 'orbit' || (!this.defaultCameraControls.staticMode && !touch) || !this.selectedObject) {
            return;
        }
        if (this.hoveredResponsiveObject && Object.keys(this.takenObjects).length > 0 && this.takenObjects[this.selectedObject.name]) {
            var interaction = this.nature.interactions[this.selectedObject.name + "|" + this.hoveredResponsiveObject.name];
            if (interaction) {
                if (this[interaction.applyFn]) {
                    this[interaction.applyFn].call(this, interaction.applyFnArgs);
                }
            }
        }
    }

    zoomModeHandler(state = false) {
        if (state) {
            for (var zoomModeInSubscriberName in this.webGLContainerEventsSubcribers.zoommodein) {
                var subscriber = this.webGLContainerEventsSubcribers.zoommodein[zoomModeInSubscriberName];
                subscriber.callback.call(subscriber.instance, event);
            }
        } else {
            for (var zoomModeOutSubscriberName in this.webGLContainerEventsSubcribers.zoommodeout) {
                var subscriber = this.webGLContainerEventsSubcribers.zoommodeout[zoomModeOutSubscriberName];
                subscriber.callback.call(subscriber.instance, event);
            }
        }
    }

    setupShadows(iniObj) {
        iniObj.defaultPointLight.shadow.mapSize.width = 512;  // default
        iniObj.defaultPointLight.shadow.mapSize.height = 512; // default
        iniObj.defaultPointLight.shadow.camera.near = 0.5;    // default
        iniObj.defaultPointLight.shadow.camera.far = 500      // default
        iniObj.defaultPointLight.castShadow = true;

        this.webGLRenderer.shadowMap.enabled = true;
        this.webGLRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.nature.shadows.cast.forEach((castShadowMeshName) => {
            this.vLabScene.getObjectByName(castShadowMeshName).castShadow = true;
            this.vLabScene.getObjectByName(castShadowMeshName).receiveShadow = false;
        });
        this.nature.shadows.receive.forEach((receiveShadowMeshName) => {
            this.vLabScene.getObjectByName(receiveShadowMeshName).receiveShadow = true;
        });
    }
}
