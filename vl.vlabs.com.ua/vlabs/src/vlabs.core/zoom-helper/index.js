import * as THREE               from 'three';
import * as TWEEN               from 'tween.js';
// import * as DOMUtils            from '../../vlabs.core/utils/dom.utils.js';
import * as StringUtils         from '../../vlabs.core/utils/string.utils.js';

export default class ZoomHelper {

    /*
    initObj {
        context: [obligatory],
        targetObjectName: "[obligatory]",
        parent: undefined
        minDistance: 0.35
        positionDeltas: new THREE.Vector3(0.0, 0.0, 0.0), 
        scale: new THREE.Vector3(0.0, 0.0, 0.0),
        color: 0xffffff
    }
    */
    constructor(initObj) {
        this.initObj = initObj;
        this.context = initObj.context;

        this.context = this.initObj.context;

        var textureLoader = new THREE.TextureLoader();
        Promise.all([
            textureLoader.load('../vlabs.assets/img/magnifier.png'),
        ])
        .then((result) => {
            this.handlerSpriteTexture = result[0];
            this.initialize();

            return this;
        })
        .catch(error => {
            console.error(error);
        });
    }

    initialize() {

        var handlerSpriteMaterial = new THREE.SpriteMaterial({
            map: this.handlerSpriteTexture,
            color: this.initObj.color ? this.initObj.color : 0xffffff,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: this.initObj.opacity ? this.initObj.opacity : 0.5,
            rotation: this.initObj.rotation ? this.initObj.rotation : 0.0,
            depthTest: this.initObj.depthTest !== undefined ? this.initObj.depthTest : true,
            depthWrite: this.initObj.depthWrite !== undefined ? this.initObj.depthWrite : true
        });

        this.handlerSprite = new THREE.Sprite(handlerSpriteMaterial);
        this.handlerSprite.name = this.initObj.targetObjectName + "ZoomHelperSprite_" + StringUtils.getRandomString(8);
        this.handlerSprite.scale.copy(this.initObj.scale ? this.initObj.scale : new THREE.Vector3(1.0, 1.0, 1.0));
        this.handlerSprite.position.x += this.initObj.positionDeltas ? this.initObj.positionDeltas.x : 0.0;
        this.handlerSprite.position.y += this.initObj.positionDeltas ? this.initObj.positionDeltas.y : 0.0;
        this.handlerSprite.position.z += this.initObj.positionDeltas ? this.initObj.positionDeltas.z : 0.0;

        if (this.initObj.parent) {
            this.targetObject = this.initObj.parent.getObjectByName(this.initObj.targetObjectName);
        } else {
            this.targetObject = this.context.vLabScene.getObjectByName(this.initObj.targetObjectName);
        }

        this.handlerSprite.visible = (this.initObj.visible !== undefined) ? this.initObj.visible : true;

        this.targetObject.add(this.handlerSprite);

        //VLab events subscribers
        this.context.webGLContainerEventsSubcribers.mouseup["ZoomHelper" + this.handlerSprite.name + "vLabSceneMouseUp"] = 
        {
            callback: this.onVLabSceneMouseUp,
            instance: this
        };
        this.context.webGLContainerEventsSubcribers.touchend["ZoomHelper" + this.handlerSprite.name + "vLabSceneTouchEnd"] = 
        {
            callback: this.onVLabSceneTouchEnd,
            instance: this
        };
        this.context.webGLContainerEventsSubcribers.resetview["ZoomHelper" + this.handlerSprite.name + "vLabSceneResetView"] = 
        {
            callback: this.onVLabSceneResetView,
            instance: this
        };

        console.log("ZoomHelper initialized for " + this.initObj.targetObjectName);
    }

    onVLabSceneMouseUp(event) {
        // console.log("ZoomHelper" + this.initObj.targetObjectName + "vLabSceneMouseUp", event.type);
        this.interactionEvent();
    }

    onVLabSceneTouchEnd(event) {
        // console.log("ZoomHelper" + this.initObj.targetObjectName + "vLabSceneTouchEnd", event.type);
        this.interactionEvent();
    }

    interactionEvent() {
        if (this.context.defaultCameraControls.type !== 'orbit' || this.context.paused || !this.handlerSprite.visible) {
            return;
        }
        this.context.helpersRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);

        var intersectObjects = this.context.interactivesSuppressorsObjects.slice();
        intersectObjects.push(this.handlerSprite);

        var intersects = this.context.helpersRaycaster.intersectObjects(intersectObjects);

        if (intersects.length > 0) {
            // console.log(intersects[0].object.name, this.handlerSprite.name);
            if (intersects[0].object.name == this.handlerSprite.name) {
                this.activate();
            }
        }
    }

    activate(actionObj) {
        this.handlerSprite.visible = false;

        /* Save back state only for first activation of ZoomHelper */
        if (!this.context.zoomHelperMode) {
            this.context.defaultCameraControls.backState = {
                minDistance: this.context.defaultCameraControls.minDistance,
                maxDistance: this.context.defaultCameraControls.maxDistance,
                position: this.context.defaultCameraControls.object.position.clone(),
                target: this.context.defaultCameraControls.target.clone(),
                minAzimuthAngle: this.context.defaultCameraControls.minAzimuthAngle,
                maxAzimuthAngle: this.context.defaultCameraControls.maxAzimuthAngle,
                minPolarAngle: this.context.defaultCameraControls.minPolarAngle,
                maxPolarAngle: this.context.defaultCameraControls.maxPolarAngle,
                enablePan: this.context.defaultCameraControls.enablePan,
            };
        }

        this.context.zoomMode = true;

        var zoomTarget = this.context.getWorldPosition(this.handlerSprite);
        this.context.defaultCameraControls.enableZoom = false;
        this.context.defaultCameraControls.enablePan = false;
        this.context.defaultCameraControls.minDistance = this.initObj.minDistance;

        this.context.zoomViewArea.style.display = 'block';

        var orbitTargetPos = (this.initObj.targetObjectIsAnOrbitTarget === true) ? this.context.getWorldPosition(this.targetObject).clone() : zoomTarget;
        if (this.initObj.orbitTargetPositionDeltas !== undefined) {
            orbitTargetPos.add(this.initObj.orbitTargetPositionDeltas);
        }
        new TWEEN.Tween(this.context.defaultCameraControls.target)
        .to({ x: orbitTargetPos.x, y: orbitTargetPos.y, z: orbitTargetPos.z }, 500)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => {
            this.context.defaultCameraControls.update();
            this.context.tooltipHide();
        })
        .onComplete(() => {
            new TWEEN.Tween(this.context.defaultCameraControls)
            .to({ maxDistance: this.initObj.maxDistance ? this.initObj.maxDistance : 0.25 }, 750)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => { 
                this.context.defaultCameraControls.update();
                if (this.context.zoomViewArea.opacity < 1.0) {
                    this.context.zoomViewArea.style.opacity = this.context.zoomViewArea.opacity;
                    this.context.zoomViewArea.opacity += 0.1; 
                }
            })
            .onComplete(() => {
                this.context.backFromViewButton.style.display = 'block';
                this.context.backFromViewButton.removeEventListener("mouseup", this.reset);
                this.context.backFromViewButton.removeEventListener("touchend", this.reset);
                this.context.backFromViewButton.addEventListener("mouseup", this.reset.bind(this), false);
                this.context.backFromViewButton.addEventListener("touchend", this.reset.bind(this), false);

                if (this.initObj.minAzimuthAngle)
                    this.context.defaultCameraControls.minAzimuthAngle =  this.initObj.minAzimuthAngle;
                if (this.initObj.maxAzimuthAngle)
                    this.context.defaultCameraControls.maxAzimuthAngle =  this.initObj.maxAzimuthAngle;
                if (this.initObj.minPolarAngle)
                    this.context.defaultCameraControls.minPolarAngle =  this.initObj.minPolarAngle;
                if (this.initObj.maxPolarAngle)
                    this.context.defaultCameraControls.maxPolarAngle =  this.initObj.maxPolarAngle;

                // console.log(this.context.defaultCameraControls);

                this.context.zoomHelperMode = true;
                this.context.zoomViewArea.style.opacity = 1.0;

                if (actionObj !== undefined) {
                    if (actionObj.finalTarget !== undefined) {
                        new TWEEN.Tween(this.context.defaultCameraControls.target)
                        .to({ x: actionObj.finalTarget.x, y: actionObj.finalTarget.y, z: actionObj.finalTarget.z }, 500)
                        .easing(TWEEN.Easing.Linear.None)
                        .onUpdate(() => {
                            this.context.defaultCameraControls.update();
                        })
                        .start();
                    }
                    if (actionObj.backFromViewButtonHidden !== undefined) {
                        if (actionObj.backFromViewButtonHidden == true) {
                            this.context.backFromViewButton.style.display = 'none';
                        }
                    }
                }

                if (this.initObj.zoomCompleteCallback !== undefined) {
                    this.initObj.zoomCompleteCallback.call(this.context, {});
                }

                // this.context.lastActivatedZoomHelper = this;
            })
            .start();
            })
        .start();
    }

    reset(event) {
        if (event !== undefined) event.stopPropagation();
        if (this.context.defaultCameraControls.backState === undefined) {
            this.context.defaultCameraControls.reset();
            return;
        }
        var prevTarget = this.context.defaultCameraControls.backState.target;

        this.context.defaultCameraControls.enabled = false;

        this.context.defaultCameraControls.maxDistance = this.context.defaultCameraControls.backState.maxDistance;
        this.context.defaultCameraControls.minAzimuthAngle =  this.context.defaultCameraControls.backState.minAzimuthAngle;
        this.context.defaultCameraControls.maxAzimuthAngle = this.context.defaultCameraControls.backState.maxAzimuthAngle;
        this.context.defaultCameraControls.minPolarAngle =  this.context.defaultCameraControls.backState.minPolarAngle;
        this.context.defaultCameraControls.maxPolarAngle = this.context.defaultCameraControls.backState.maxPolarAngle;
        this.context.defaultCameraControls.enablePan = this.context.defaultCameraControls.backState.enablePan;

        new TWEEN.Tween(this.context.defaultCameraControls)
        .to({ minDistance: this.context.defaultCameraControls.backState.minDistance }, 250)
        .easing(TWEEN.Easing.Cubic.InOut)
        .onUpdate(() => { 
            this.context.defaultCameraControls.update();
        })
        .onComplete(() => {
            new TWEEN.Tween(this.context.defaultCameraControls.target)
            .to({ x: prevTarget.x, y: prevTarget.y, z: prevTarget.z }, 500)
            .easing(TWEEN.Easing.Cubic.InOut)
            .start();

            var prevPosition = this.context.defaultCameraControls.backState.position.clone();
            new TWEEN.Tween(this.context.defaultCameraControls.object.position)
            .to({ x: prevPosition.x, y: prevPosition.y, z: prevPosition.z }, 500)
            .easing(TWEEN.Easing.Cubic.InOut)
            .onUpdate(() => {
                this.context.defaultCameraControls.update();
            })
            .onComplete(() => {
                this.onVLabSceneResetView();
                this.context.zoomHelperMode = false;
                this.context.zoomViewArea.style.display = 'none';
                this.context.zoomMode = false;
                this.context.defaultCameraControls.resetState();
                if (this.initObj.hideOnExit === true) {
                    this.hide();
                }
                this.context.zoomModeHandler(false);
                this.context.zoomViewArea.opacity = 0.0;
                this.context.zoomViewArea.style.opacity = 0.0;
            })
            .start();
        })
        .start();
    }

    onVLabSceneResetView() {
        // this.context.defaultCameraControls.enableZoom = true;
        // this.context.defaultCameraControls.enablePan = true;
        this.context.defaultCameraControls.backState = undefined;
        this.context.backFromViewButton.removeEventListener("mouseup", this.reset);
        this.context.backFromViewButton.removeEventListener("touchend", this.reset);
        this.context.backFromViewButton.style.display = 'none';

        this.handlerSprite.visible = true;
        this.context.zoomMode = false;

        this.context.zoomHelperMode = false;
    }

    hide() {
        this.handlerSprite.visible = false;
    }

    show() {
        this.handlerSprite.visible = true;
    }

    setMaterial(materialObj) {
        if (this.handlerSprite == undefined) return;
        let extendedMaterialObj = this.handlerSprite.material;
        Object.assign(extendedMaterialObj, materialObj);
        this.handlerSprite.material = extendedMaterialObj;
        this.handlerSprite.material.needsUpdate = true;
    }
}