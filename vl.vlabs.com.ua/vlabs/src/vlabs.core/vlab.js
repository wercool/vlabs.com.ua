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

        this.mouseCoords = new THREE.Vector2();
        this.mouseCoordsRaycaster = new THREE.Vector2();
        this.iteractionRaycaster = new THREE.Raycaster();

        this.interactiveObjects = [];

        this.hoveredObject = undefined;
        this.preSelectedObject = undefined;
        this.selectedObject = undefined;
        this.selectionSphere = undefined;
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
        this.webGLContainer.addEventListener("mousemove",   this.onMouseMove.bind(this), false);
        this.webGLContainer.addEventListener("mousedown",   this.onMouseDown.bind(this), false);
        this.webGLContainer.addEventListener("touchstart",  this.onTouchStart.bind(this), false);
        this.webGLContainer.addEventListener("touchend",    this.onTouchEnd.bind(this), false);
        document.addEventListener("pointerlockchange", this.onPointerLockChanged.bind(this), false);
        // this.webGLContainer.addEventListener("mouseup", this.onMouseUp.bind(this), false);

        this.setInteractiveObjects();
        this.setDefaultCamera();
        this.setDefaultLighting();
        this.setupCrosshair();
        this.setupSelectionHelpers();
        this.setManipulationControl();
        this.setupCircularMenu();

        document.getElementById("overlayContainer").style.display = 'none';
        document.getElementById("progressBar").style.display = 'none';

        this.webGLContainer.style.display = 'block';
        this.resiezeWebGLContainer();

        this.initialized = true;
        this.paused = false;

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

            dispatchEvent(this.redererFrameEvent);

            requestAnimationFrame(this.render.bind(this));
        } else {
            setTimeout(this.render.bind(this), 250);
        }
    }

    setInteractiveObjects() {
        for (var interactiveObjectName of this.nature.interactiveObjects) {
            this.interactiveObjects.push(this.vLabScene.getObjectByName(interactiveObjectName));
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
        }
    }

    onTouchStart(event) {
        this.mouseCoords.set(event.touches[0].clientX, event.touches[0].clientY);
        this.mouseCoordsRaycaster.set((event.touches[0].clientX / this.webGLContainer.clientWidth) * 2 - 1, 1 - (event.touches[0].clientY / this.webGLContainer.clientHeight) * 2);
    }

    onTouchEnd(event) {
        this.toggleSelectedObject(true);
    }

    onPointerLockChanged(event) {
        if (!document.pointerLockElement) {
            if (this.defaultCameraControls.getObject) {
                var curPos = this.defaultCameraControls.getObject().position.clone();
                this.switchCameraControls({ type: 'orbit', 
                                            targetPos: curPos,
                                            target: curPos.clone().setLength(curPos.length() * 0.85) });
            }
        }
    }

    switchCameraControls(cameraControlConfig) {
        if (this.defaultCameraControls) {
            if (this.defaultCameraControls.type) {

                if (this.defaultCameraControls.type == cameraControlConfig.type) {
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
                        this.defaultCamera.position.copy(this.defaultCameraInitialPosition.clone());
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
                this.defaultCameraControls.update();
            break;
            case 'pointerlock':
                if (this.defaultCameraControls) {
                    if (this.defaultCameraControls.type == 'orbit') {
                        this.defaultCamera.position.y = this.defaultCameraInitialPosition.y;
                    }
                }
                this.defaultCameraControls = new PointerLockControls(this.defaultCamera, this.vLabScene);
                this.defaultCameraControls.enabled = true;
                this.crosshair.visible = true;
                this.defaultCameraControls.update();
                this.defaultCameraControls.requestPointerLock();
            break;
            case 'assistant':
            break;
        }
        this.defaultCameraControls.type = cameraControlConfig.type;
    }

    updateCameraControlsCheckIntersections() {
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

        if (interactionObjectIntersects) {
            if (interactionObjectIntersects.length > 0) {
                if (interactionObjectIntersects[0].object !== this.hoveredObject && this.hoveredObject != this.selectedObject && this.selectionSphere) {
                    this.selectionSphere.visible = false;
                    this.tooltipHide();
                }
                this.hoveredObject = interactionObjectIntersects[0].object;
                this.selectionSphere = this.vLabScene.getObjectByName(interactionObjectIntersects[0].object.name + "_SELECTION");
                this.selectionSphere.visible = true;
                this.tooltipShow(this.hoveredObject);
                this.webGLContainer.style.cursor = 'pointer';
            } else {
                if (this.selectionSphere) {
                    if (this.hoveredObject !== this.selectedObject) {
                        this.clearNotSelected();
                    }
                    this.selectionSphere = undefined;
                    this.cMenu.hide();
                }
                if (this.hoveredObject) {
                    this.hoveredObject = undefined;
                }
                this.tooltipHide();
                this.webGLContainer.style.cursor = 'auto';
            }
        }

        this.defaultCameraControls.active = false;
    }

    toggleSelectedObject(touch = false) {
        if (this.hoveredObject) {
            if (!touch || (touch && this.hoveredObject == this.preSelectedObject)) {
                this.selectedObject = this.hoveredObject;
                this.selectionSphere = this.vLabScene.getObjectByName(this.selectedObject.name + "_SELECTION");
                this.cMenu.hide();
                this.selectionSphere.material.color = new THREE.Color(0, 1, 1);

                if (this.nature.objectMenus[this.selectedObject.name])
                {
                    if (this.nature.objectMenus[this.selectedObject.name][this.nature.lang]) {
                        this.selectionSphere.material.color = new THREE.Color(0, 1, 0);
                    }
                }

                if (this.defaultCameraControls.type == 'orbit') {
                    if (this.selectedObject == this.preSelectedObject) {
                        new TWEEN.Tween(this.defaultCameraControls.target)
                        .to({ x: this.selectedObject.position.x, z: this.selectedObject.position.z }, 500)
                        .easing(TWEEN.Easing.Cubic.InOut)
                        .onUpdate(() => { 
                            this.defaultCameraControls.update();
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
            selectionSphere.visible = false;
            selectionSphere.material.color = new THREE.Color(1, 1, 0);
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
                selectionSphere.visible = false;
                selectionSphere.material.color = new THREE.Color(1, 1, 0);
            }
        }
        this.tooltipHide();
    }

    setDefaultLighting() {
        let ambientLight = new THREE.AmbientLight(0x111111);
        ambientLight.intensity = 3.0;
        ambientLight.name = 'ambientLight';
        this.vLabScene.add(ambientLight);
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

    toScreenPosition(obj)
    {
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
            this.addSelectionSphereToObject(interactiveObject);
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
        var sphereGeom = new THREE.SphereGeometry(interactiveObject.geometry.boundingSphere.radius * 1.1, 12, 8);
        sphereGeom.rotateX(1.57);
        var sphereMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(1, 1, 0), // yellow ring
          transparent: true, // to make our alphaMap work, we have to set this parameter to `true`
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
        if (this.nature.objectMenus[this.selectedObject.name])
        {
            if (this.nature.objectMenus[this.selectedObject.name][this.nature.lang]) {
                this.cMenu.config({
                    menus: this.nature.objectMenus[this.selectedObject.name][this.nature.lang]
                });

                var selectionSphere = this.vLabScene.getObjectByName(this.selectedObject.name + "_SELECTION");
                var screenPos = this.toScreenPosition(selectionSphere);
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
            }
        }
    }

    tooltipShow(obj) {
        var tooltip = document.getElementById("tooltip");
        if (obj.userData.tooltipShown === undefined) obj.userData.tooltipShown = 0;
        if (this.nature.tooltips[obj.name] && obj.userData.tooltipShown < this.nature.tooltips[obj.name].timesToShow && tooltip.style.display !== 'block') {
            var screenPos = this.toScreenPosition(obj);
            tooltip.innerText = this.nature.tooltips[obj.name][this.nature.lang];
            tooltip.style.left = screenPos.x + 'px';
            tooltip.style.top = screenPos.y + 25 + 'px';
            tooltip.style.display = 'block';
            obj.userData.tooltipShown++;
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
}