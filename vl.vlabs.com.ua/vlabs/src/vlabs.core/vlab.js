import * as THREE                   from 'three';
import THREEStats                   from 'stats.js';
import * as HTTPUtils               from "./utils/http.utils"
import * as TWEEN                   from 'tween.js';
import iziToast                     from 'izitoast';

var ProgressBar             = require('progressbar.js');
var webglDetect             = require('webgl-detect');
var OrbitControls           = require('./three-orbit-controls/index')(THREE);
var PointerLockControls     = require('./three-pointerlock/index');
var TransformControls       = require('./three-transformcontrols/index');
var CMenu                   = require('./circular-menu/circular-menu.js');
var popupS                  = require('./popups/popupS.min.js');
/*
initObj {
    "natureURL": "nature.json",
    "webGLContainer": "webGLContainer"
}
*/
export default class VLab {

    constructor(initObj = {}) {
        if (this.constructor === VLab) {
            throw new TypeError("Cannot construct VLab instances directly");
        }

        /* Events */
        this.sceneCompleteEvent = new Event('sceneCompleteEvent');
        this.redererFrameEvent  = new Event('redererFrameEvent');
        this.activatedEvent     = new Event('activatedEvent');

        this.initObj = initObj;
        this.initialized = false;
        this.paused = true;
        this.nature = {};
        this.webGLContainer = undefined;
        this.webGLRenderer = undefined;

        this.vLabScene = undefined;
        this.defaultCamera = undefined;
        this.defaultCameraInitialPosition = undefined;
        this.defaultCameraControls = undefined;

        this.statsTHREE = undefined;
        this.progressBar = undefined;
        this.progressBarPrependText = "";

        this.helpers = {
            "zoomHelper": {
                "url": "../vlabs.assets/img/magnifier.png",
                "texture": undefined,
                "assigned": [],
                "selected": undefined
            },
            "placeHelper": {
                "url": "../vlabs.assets/img/place.png",
                "texture": undefined,
                "sprite": undefined
            }
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

        this.hoveredObject = undefined;
        this.preSelectedObject = undefined;
        this.selectedObject = undefined;
        this.selectionSphere = undefined;

        this.hoveredResponsiveObject = undefined;

        this.takenObjects = {};
    }

    getVesrion() {
        return "0.0.2";
    }

    showErrorMessage(error) {
        document.getElementById("overlayContainer").style.display = 'block';
        document.getElementById("modalMessage").style.display = 'block';
        document.getElementById("modalMessage").innerHTML = error.message;
    }

    preInitialize() {
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
            antialias: false
        });

        this.webGLRenderer.setClearColor(0x000000);

        // // prevent logging
        // this.webGLRenderer.context.getShaderInfoLog = function () { return '' };
        // this.webGLRenderer.context.getProgramInfoLog = function () { return '' };

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
            if (!this.vLabScene.getObjectByName(defaultCamera.name)) {
                this.vLabScene.add(defaultCamera);
            }
            return;
        }

        if (this.nature.defaultSceneCameraName) {
            this.defaultCamera = this.vLabScene.getObjectByName(this.nature.defaultSceneCameraName);
        } else {
            this.defaultCamera = new THREE.PerspectiveCamera(70, this.webGLContainer.clientWidth / this.webGLContainer.clientHeight, 0.1, 200);
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
            this.allowedSpaceMapObject.material = new THREE.MeshBasicMaterial({ map: alowedSpaceMap });

            var alowedSpaceMapImage = this.allowedSpaceMapObject.material.map.image;
            this.allowedSpaceCanvas = document.createElement('canvas');
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

        // vLabScene.traverse(function(obj) {
        //     console.log(obj);
        // });

        this.vLabScene = (vLabScene) ? vLabScene : new THREE.Scene();

        dispatchEvent(this.sceneCompleteEvent);
    }

    activate() {
        this.setWebGLRenderer();

        if (this.nature.showTHREEStats) {
            this.setTHREEStats();
        }

        window.addEventListener("mouseup", this.onMouseUpWindow.bind(this), false);
        this.webGLContainer.addEventListener("mousemove", this.onMouseMove.bind(this), false);
        this.webGLContainer.addEventListener("mousedown", this.onMouseDown.bind(this), false);
        this.webGLContainer.addEventListener("touchstart", this.onTouchStart.bind(this), false);
        this.webGLContainer.addEventListener("touchend", this.onTouchEnd.bind(this), false);

        document.addEventListener("pointerlockchange", this.onPointerLockChanged.bind(this), false);
        document.addEventListener("mozpointerlockchange", this.onPointerLockChanged.bind(this), false);
        document.addEventListener("webkitpointerlockchange", this.onPointerLockChanged.bind(this), false);

        document.addEventListener("fullscreenchange", this.onFullscreenChanged.bind(this), false);
        document.addEventListener("mozfullscreenchange", this.onFullscreenChanged.bind(this), false);
        document.addEventListener("webkitfullscreenchange", this.onFullscreenChanged.bind(this), false);
        document.addEventListener("msfullscreenchange", this.onFullscreenChanged.bind(this), false);

        document.getElementById("fullscreen").addEventListener("mouseup", this.toggleFullscreen.bind(this), false);
        document.getElementById("resetview").addEventListener("mouseup", this.resetView.bind(this), false);
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

        document.getElementById("overlayContainer").style.display = 'none';
        document.getElementById("progressBar").style.display = 'none';

        this.webGLContainer.style.display = 'block';
        this.resiezeWebGLContainer();

        this.initialized = true;
        this.paused = false;

        this.resetView();

        dispatchEvent(this.activatedEvent);
    }

    loadScene(loaderMessage) {
        return new Promise((resolve, reject) => {
            let thisVLab = this;
            thisVLab.progressBarPrependText = (loaderMessage)? loaderMessage : "The world of VLab is loaded by ";
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

    loadVLabItem(itemURL, vlabItemName) {
        return new Promise((resolve, reject) => {
            let thisVLab = this;
            document.getElementById("overlayContainer").style.display = 'block';
            document.getElementById("progressBar").style.display = 'block';
            thisVLab.progressBarPrependText = (vlabItemName)? "VLab Item [" + vlabItemName + "] is loaded by " : "VLab item is loaded by ";
            if (itemURL) {
                let loader = new THREE.ObjectLoader();
                loader.convertUpAxis = true;
                loader.load(itemURL, 
                    // onLoad callback
                    function (vLabItem) {
                        resolve(vLabItem);
                        document.getElementById("overlayContainer").style.display = 'none';
                        document.getElementById("progressBar").style.display = 'none';
                    },
                    // onProgress callback
                    function (bytes) {
                        let loadedRel = (bytes.loaded / bytes.total).toFixed(2);
                        console.info("VLab Item" + ((vlabItemName) ? (" [" + vlabItemName) + "] " : " ") + (loadedRel * 100).toFixed(2) + "% loaded");

                        if (thisVLab.progressBar) {
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

    getNatureFromURL(url) {
        return HTTPUtils.getJSONFromURL(url);
    }

    render(time) {
        if (this.initialized && !this.paused) {
            if (this.statsTHREE) this.statsTHREE.begin();

            this.webGLRenderer.clear();
            this.webGLRenderer.render(this.vLabScene, this.defaultCamera);

            if (this.statsTHREE) this.statsTHREE.end();

            this.updateCameraControlsCheckIntersections();

            TWEEN.update(time);

            this.takenToResponsiveArrowUpdate();

            dispatchEvent(this.redererFrameEvent);

            requestAnimationFrame(this.render.bind(this));
        } else {
            setTimeout(this.render.bind(this), 250);
        }
    }

    setInteractiveObjects(except) {
        this.interactiveObjects = [];
        for (var interactiveObjectName of this.nature.interactiveObjects) {
            if ((Array.isArray(except) && !except.includes(interactiveObjectName)) || (!Array.isArray(except) && except !== interactiveObjectName)) {
                this.interactiveObjects.push(this.vLabScene.getObjectByName(interactiveObjectName));
            }
        }
        this.nature.interactiveObjects = [];
        for (var interactiveObject of this.interactiveObjects) {
            this.nature.interactiveObjects.push(interactiveObject.name);
        }
    }

    setReponsiveObjects(except) {
        this.responosiveObjects = [];
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

    onMouseMove(event) {
        this.mouseCoords.set(event.x, event.y);
        this.mouseCoordsRaycaster.set((event.x / this.webGLContainer.clientWidth) * 2 - 1, 1 - (event.y / this.webGLContainer.clientHeight) * 2);
        this.defaultCameraControls.active = true;
    }

    onMouseDown(event) {
        this.mouseCoords.set(event.x, event.y);
        this.mouseCoordsRaycaster.set((event.x / this.webGLContainer.clientWidth) * 2 - 1, 1 - (event.y / this.webGLContainer.clientHeight) * 2);
        this.toggleSelectedObject();
        this.executeActions();
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
    }

    onTouchStart(event) {
        this.mouseCoords.set(event.touches[0].clientX, event.touches[0].clientY);
        this.mouseCoordsRaycaster.set((event.touches[0].clientX / this.webGLContainer.clientWidth) * 2 - 1, 1 - (event.touches[0].clientY / this.webGLContainer.clientHeight) * 2);
    }

    onTouchEnd(event) {
        this.toggleSelectedObject(true);
        this.helpersTrigger();
        this.executeActions(true);
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
            document.getElementById("fullscreen").style.backgroundImage = "url('../vlabs.assets/img/fullscreen.png')";
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
                this.defaultCameraControls = new OrbitControls(this.defaultCamera, this.webGLContainer, initialPos);
                if (cameraControlConfig.target) {
                    this.defaultCameraControls.target = cameraControlConfig.target;
                }
                if (cameraControlConfig.targetObjectName) {
                    this.defaultCameraControls.target = this.vLabScene.getObjectByName(cameraControlConfig.targetObjectName).position.clone();
                }
                if (this.nature.cameraControls.maxDistance) {
                    this.defaultCameraControls.maxDistance = this.nature.cameraControls.maxDistance;
                }
                if (this.nature.cameraControls.maxPolarAngle) {
                    this.defaultCameraControls.maxPolarAngle = this.nature.cameraControls.maxPolarAngle;
                }
                if (this.nature.cameraControls.minPolarAngle) {
                    this.defaultCameraControls.minPolarAngle = this.nature.cameraControls.minPolarAngle;
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
        if (this.defaultCameraControls.zoomMode) {
            return;
        }
        var interactionObjectIntersects = undefined;
        if (this.defaultCameraControls.type === 'pointerlock') {
            this.defaultCameraControls.update();
            if (this.defaultCameraControls.active) {
                this.iteractionRaycaster.setFromCamera({x: 0, y: 0}, this.defaultCamera);
                interactionObjectIntersects = this.iteractionRaycaster.intersectObjects(this.interactiveObjects);
            }
        } else if (this.defaultCameraControls.type === 'orbit') {
            if (this.defaultCameraControls.active) {
                this.iteractionRaycaster.setFromCamera(this.mouseCoordsRaycaster, this.defaultCamera);
                interactionObjectIntersects = this.iteractionRaycaster.intersectObjects(this.interactiveObjects);
            }
        }


        if (this.defaultCameraControls.active) {
            if (interactionObjectIntersects) {
                if (interactionObjectIntersects.length > 0) {
                    if (interactionObjectIntersects[0].object !== this.hoveredObject && this.hoveredObject != this.selectedObject) {
                        if (!this.nature.interactiveObjectOutlined) {
                            if (this.selectionSphere) this.selectionSphere.visible = false;
                        }
                    }

                    if (this.hoveredResponsiveObject) {
                        this.hoveredResponsiveObject.material.emissive = new THREE.Color(0, 0, 0);
                        this.hoveredResponsiveObject = undefined;
                        this.tooltipHide();
                    }

                    this.tooltipShow(interactionObjectIntersects[0].object);
                    this.hoveredObject = interactionObjectIntersects[0].object;
                    this.webGLContainer.style.cursor = 'pointer';
                    if (!this.nature.interactiveObjectOutlined) {
                        this.selectionSphere = this.vLabScene.getObjectByName(interactionObjectIntersects[0].object.name + "_SELECTION");
                        this.selectionSphere.visible = true;
                    } else {
                        // TODO
                    }

                    this.defaultCameraControls.active = false;
                    return;

                } else {
                    if (!this.nature.interactiveObjectOutlined) {
                        if (this.selectionSphere) {
                            if (this.hoveredObject !== this.selectedObject) {
                                this.clearNotSelected();
                            }
                            this.selectionSphere = undefined;
                            this.cMenu.hide();
                        }
                    } else {
                        // TODO
                    }
                    if (this.hoveredObject) {
                        this.hoveredObject = undefined;
                    }
                    this.webGLContainer.style.cursor = 'auto';
                }
            }

            if (this.selectedObject) {
                if (this.takenObjects[this.selectedObject.name]) {
                    var responsiveObjectsItersects = undefined;

                    this.responsiveRaycaster.setFromCamera(this.mouseCoordsRaycaster, this.defaultCamera);
                    responsiveObjectsItersects = this.responsiveRaycaster.intersectObjects(this.responosiveObjects);

                    if (responsiveObjectsItersects) {
                        if (this.hoveredResponsiveObject) {
                            this.hoveredResponsiveObject.material.emissive = new THREE.Color(0, 0, 0);
                            this.hoveredResponsiveObject = undefined;
                            this.tooltipHide();
                        }
                        if (responsiveObjectsItersects.length > 0) {
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

            if (this.allowedSpaceMapObject && this.defaultCameraControls.enabled) {
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
                    var pixelData = this.allowedSpaceCanvas.getContext('2d').getImageData(255 * uv.x, 255 * uv.y, 1, 1).data;
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
    }

    toggleSelectedObject(touch = false) {
        if (this.defaultCameraControls.zoomMode) {
            return;
        }
        if (this.hoveredObject) {
            if (!touch || (touch && this.hoveredObject == this.preSelectedObject)) {
                this.selectedObject = this.hoveredObject;
                this.cMenu.hide();
                if (!this.nature.interactiveObjectOutlined) {
                    this.selectionSphere = this.vLabScene.getObjectByName(this.selectedObject.name + "_SELECTION");
                    this.selectionSphere.material.color = new THREE.Color(0, 1, 1);
                }

                if (this.hoveredResponsiveObject) {
                    this.hoveredResponsiveObject.material.emissive = new THREE.Color(0, 0, 0);
                    this.hoveredResponsiveObject = undefined;
                }

                if (this.nature.objectMenus[this.selectedObject.name])
                {
                    if (this.nature.objectMenus[this.selectedObject.name][this.nature.lang]) {
                        if (!this.nature.interactiveObjectOutlined) {
                            this.selectionSphere.material.color = new THREE.Color(0, 1, 0);
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
                                    this.showObjectSpecificCircularMenu();
                                } else {
                                    if (this.selectedObject) {
                                        if (this.selectedObject == this.hoveredObject) {
                                            this.showObjectSpecificCircularMenu();
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
            if (!this.nature.interactiveObjectOutlined) {
                var selectionSphere = this.vLabScene.getObjectByName(interactiveObject.name + "_SELECTION");
                if (selectionSphere) {
                    selectionSphere.visible = false;
                    selectionSphere.material.color = new THREE.Color(1, 1, 0);
                }
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
                if (!this.nature.interactiveObjectOutlined) {
                    var selectionSphere = this.vLabScene.getObjectByName(interactiveObject.name + "_SELECTION");
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
        if (!this.nature.interactiveObjectOutlined) {
            for (var interactiveObject of this.interactiveObjects) {
                this.addSelectionSphereToObject(interactiveObject);
            }
        } else {
            console.log("interactiveObjectOutlined");
        }
    }

    addSelectionSphereToObject(interactiveObject) {
        var canvas = document.createElement("canvas");
        canvas.width = 128;
        canvas.height = 128;
        var ctx = canvas.getContext("2d");
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
          transparent: true, // to make our alphaMap work, we have to set this parameter to `true`
          opacity: 0.75,
          alphaMap: selectionAlphaTexture
        });
        sphereMat.depthTest = false;
        sphereMat.depthWrite = false;
        var sphere = new THREE.Mesh(sphereGeom, sphereMat);
        sphere.name = interactiveObject.name + "_SELECTION";
        sphere.visible = false;
        sphere.position.copy(interactiveObject.geometry.boundingSphere.center.clone());
        interactiveObject.add(sphere);

        new TWEEN.Tween(sphere.scale)
        .to({x: 1.2, y: 1.2}, 500)
        .repeat(Infinity)
        .yoyo(true)
        .easing(TWEEN.Easing.Quadratic.InOut).start();
    }

    setManipulationControl() {
        this.manipulationControl = new TransformControls(this.defaultCamera, this.webGLRenderer.domElement);
        this.manipulationControl.setSize(1.0);
        this.vLabScene.add(this.manipulationControl);
    }

    setupCircularMenu() {
        this.cMenu = CMenu("#cMenu");
        this.cMenu.setContext(this);
    }

    showObjectSpecificCircularMenu() {
        if (!this.selectedObject) {
            return;
        }
        if (this.nature.objectMenus[this.selectedObject.name]) {
            document.getElementById("cMenu").innerHTML = "";
            if (this.nature.objectMenus[this.selectedObject.name][this.nature.lang]) {
                this.cMenu.config({
                    menus: this.nature.objectMenus[this.selectedObject.name][this.nature.lang]
                });

                var screenPos = this.toScreenPosition(this.selectedObject);
                var cMenuPos = { x: screenPos.x, y: screenPos.y };
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
        var tooltip = document.getElementById("tooltip");
        if (obj.userData.tooltipShown === undefined) obj.userData.tooltipShown = 0;
        if (this.nature.tooltips[obj.name] && (obj.userData.tooltipShown <= this.nature.tooltips[obj.name].timesToShow || !this.nature.tooltips[obj.name].timesToShow)) {
            var screenPos = this.toScreenPosition(obj);
            tooltip.innerText = this.nature.tooltips[obj.name][this.nature.lang];
            tooltip.style.left = screenPos.x + 'px';
            tooltip.style.top = screenPos.y + 25 + 'px';
            tooltip.style.display = 'block';
            if (obj !== this.hoveredObject)
                obj.userData.tooltipShown++;
        } else {
            this.tooltipHide();
        }
    }

    tooltipHide() {
        tooltip.innerText = "";
        tooltip.style.left = '0px';
        tooltip.style.top = '0px';
        tooltip.style.display = 'none';
    }

    setTHREEStats() {
        this.statsTHREE = new THREEStats();
        this.statsTHREE.domElement.style.position = 'absolute';
        this.statsTHREE.domElement.style.left = '0px';
        this.statsTHREE.domElement.style.top = '0px';
        document.body.appendChild(this.statsTHREE.domElement);
    }

    toggleFullscreen() {
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
            document.getElementById("fullscreen").style.backgroundImage = "url('../vlabs.assets/img/fullscreen-exit.png')";
        } else {
            if(document.exitFullscreen) {
                document.exitFullscreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
            document.getElementById("fullscreen").style.backgroundImage = "url('../vlabs.assets/img/fullscreen.png')";
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

        document.getElementById("back").removeEventListener("mouseup", this.resetZoomView);
        document.getElementById("back").style.display = 'none';
        if (this.helpers.zoomHelper.selected) this.helpers.zoomHelper.selected.visible = true;
    }

    prepareHelperAssets() {
        var textureLoader = new THREE.TextureLoader();
        return Promise.all([
            textureLoader.load(this.helpers.zoomHelper.url),
            textureLoader.load(this.helpers.placeHelper.url),
        ])
        .then((result) => {
            this.helpers.zoomHelper.texture = result[0];
            this.helpers.placeHelper.texture = result[1];

            this.prepareHelpers();
        })
        .catch(error => {
            console.error(error);
        });
    }

    addZoomHelper(objectName, parent, positionDeltas, scale, rotation, colorHex) {
        if (!this.helpers.zoomHelper.texture) {
            var self = this;
            setTimeout(() => {
                console.log("Wainting for Zoom Helper texture...");
                self.addZoomHelper(objectName, parent, positionDeltas, scale);
            }, 250);
            return;
        }

        console.log("Zoom Helper texture loaded");

        var zoomHelperMaterial = new THREE.SpriteMaterial({
            map: this.helpers.zoomHelper.texture,
            color: colorHex,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.5,
            rotation: (rotation) ? rotation : 0.0,
            depthTest: false,
            depthWrite: false
        });

        var zoomHelperSprite = new THREE.Sprite(zoomHelperMaterial);
        zoomHelperSprite.scale.copy(scale);
        zoomHelperSprite.position.x += positionDeltas.x;
        zoomHelperSprite.position.y += positionDeltas.y;
        zoomHelperSprite.position.z += positionDeltas.z;

        if (parent) {
            parent.getObjectByName(objectName).add(zoomHelperSprite);
        } else {
            this.vLabScene.getObjectByName(objectName).add(zoomHelperSprite);
        }
        this.helpers.zoomHelper.assigned.push(zoomHelperSprite);
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
        this.helpers.placeHelper.sprite.scale.set(0.15, 0.15, 0.15);
        this.helpers.placeHelper.sprite.visible = false;
        this.vLabScene.add(this.helpers.placeHelper.sprite);
    }

    helpersTrigger() {
        if (this.defaultCameraControls.type !== 'orbit' || this.paused || this.defaultCameraControls.zoomMode) {
            return;
        }
        this.helpersRaycaster.setFromCamera(this.mouseCoordsRaycaster, this.defaultCamera);
        var zoomHelpersIntersects = this.helpersRaycaster.intersectObjects(this.helpers.zoomHelper.assigned);
        if (zoomHelpersIntersects.length > 0) {
            this.helpers.zoomHelper.selected = zoomHelpersIntersects[0].object;
            this.helpers.zoomHelper.selected.visible = false;
            this.defaultCameraControls.backState = {
                minDistance: this.defaultCameraControls.minDistance,
                maxDistance: this.defaultCameraControls.maxDistance,
                position: this.defaultCameraControls.object.position.clone(),
                target: this.defaultCameraControls.target.clone()
            };
            var zoomTarget = this.getWorldPosition(zoomHelpersIntersects[0].object.parent);
            this.defaultCameraControls.enableZoom = false;
            this.defaultCameraControls.enablePan = false;
            this.defaultCameraControls.minDistance = 0.25;
            this.defaultCameraControls.zoomMode = true;
            new TWEEN.Tween(this.defaultCameraControls.target)
            .to({ x: zoomTarget.x, y: zoomTarget.y, z: zoomTarget.z }, 500)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                this.defaultCameraControls.update();
                this.tooltipHide();
            })
            .onComplete(() => { 
                new TWEEN.Tween(this.defaultCameraControls)
                .to({ maxDistance: 0.25 }, 750)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(() => { 
                    this.defaultCameraControls.update();
                })
                .onComplete(() => { 
                    document.getElementById("back").style.display = 'block';
                    document.getElementById("back").removeEventListener("mouseup", this.resetZoomView);
                    document.getElementById("back").addEventListener("mouseup", this.resetZoomView.bind(this), false);
                 })
                .start();
             })
            .start();
        }
    }

    resetZoomView() {
        if (this.defaultCameraControls.backState) {
            var prevTarget = this.defaultCameraControls.backState.target;

            this.defaultCameraControls.maxDistance = this.defaultCameraControls.backState.maxDistance;

            new TWEEN.Tween(this.defaultCameraControls)
            .to({ minDistancex: this.defaultCameraControls.backState.minDistance }, 250)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => { 
                this.defaultCameraControls.update();
            })
            .onComplete(() => {
                var prevPosition = this.defaultCameraControls.backState.position.clone();
                new TWEEN.Tween(this.defaultCameraControls.object.position)
                .to({ x: prevPosition.x, y: prevPosition.y, z: prevPosition.z }, 500)
                .easing(TWEEN.Easing.Cubic.InOut)
                .onUpdate(() => { 
                    this.defaultCameraControls.update();
                })
                .onComplete(() => {
                    new TWEEN.Tween(this.defaultCameraControls.target)
                    .to({ x: prevTarget.x, y: prevTarget.y, z: prevTarget.z }, 250)
                    .easing(TWEEN.Easing.Cubic.InOut)
                    .onUpdate(() => { 
                        this.defaultCameraControls.update();
                    })
                    .onComplete(() => {
                        this.defaultCameraControls.enableZoom = true;
                        this.defaultCameraControls.enablePan = true;
                        this.defaultCameraControls.zoomMode = false;
                        this.defaultCameraControls.backState = undefined;
                        document.getElementById("back").removeEventListener("mouseup", this.resetZoomView);
                        this.helpers.zoomHelper.selected.visible = true;
                    })
                    .start();
                 })
                .start();
            })
            .start();
        }
        document.getElementById("back").style.display = 'none';
    }

    takeObject() {
        if(Object.keys(this.takenObjects).length > 3) {
            iziToast.info({
                title: 'Info',
                message: 'You can carry maximum 3 objects',
                timeout: 3000
            });
            return;
        }
        this.selectedObject.traverse(function(node) {
            if (node.type === "Mesh") {
                if (node.material.type === "MeshPhongMaterial") {
                    node.material.emissive = new THREE.Color(0.5, 0.5, 0.5);
                }
                if (!node.material.transparent) {
                    node.material.transparent = true;
                    node.material.opacity = 0.75;
                }
            }
        });
        var cameraAspectOffset = 0.075 / this.defaultCamera.aspect;
        this.selectedObject.beforeTakenRotation = this.selectedObject.rotation.clone();
        this.selectedObject.rotation.x = -0.75;
        this.selectedObject.rotation.y = -0.1;
        this.selectedObject.geometry.computeBoundingSphere();
        this.selectedObject.position.set(0.17 - cameraAspectOffset, 0.075 - Object.keys(this.takenObjects).length / 15, -0.2);
        this.selectedObject.scale.multiplyScalar(0.01 / this.selectedObject.geometry.boundingSphere.radius);
        this.selectedObject.takenRotation = new TWEEN.Tween(this.selectedObject.rotation)
        .to({z: Math.PI}, 10000)
        .repeat(Infinity)
        .yoyo(true)
        .easing(TWEEN.Easing.Quadratic.InOut).start();
        this.takenObjects[this.selectedObject.name] = this.selectedObject;
        this.defaultCamera.add(this.selectedObject);
        this.resetAllSelections();
    }

    rearrangeTakenObjects() {
        var cameraAspectOffset = 0.075 / this.defaultCamera.aspect;
        var i = 0;
        for (var takenObjectName in this.takenObjects) {
            var takenObject = this.takenObjects[takenObjectName];
            takenObject.position.set(0.17 - cameraAspectOffset, 0.075 - i / 15, -0.2);
            i++;
        }
    }

    takeOffObject(resetToBeforeTakenState) {
        if (!this.selectedObject) {
            return;
        }
        var self = this;
        this.selectedObject.takenRotation.stop();
        this.selectedObject.traverse(function(node) {
            if (node.type === "Mesh") {
                if (node.name !== self.selectedObject.name + "_SELECTION") {
                    if (node.material.type === "MeshPhongMaterial") {
                        node.material.emissive = new THREE.Color(0.0, 0.0, 0.0);
                    }
                    if (node.material.transparent) {
                        node.material.transparent = false;
                        node.material.opacity = 1.0;
                    }
                }
            }
        });
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
        this.vLabScene.add(this.selectedObject);
        this.resetAllSelections();
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
                this.takenObjectsToResponsiveObjectsArrow.setLength(hoveredResponsiveObjectDirectionVectorLength, 0.2, 0.01);
                this.helpers.placeHelper.sprite.position.copy(this.hoveredResponsiveObject.intersectionPoint);
                this.helpers.placeHelper.sprite.position.y += 0.065; 
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
}