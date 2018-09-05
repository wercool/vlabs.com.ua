import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';

export default class ThermostaticExpansionValveR410A {
    constructor(initObj) {
       this.initObj = initObj;
       this.context = initObj.context;
       this.pos = initObj.pos;

       this.itemName = this.initObj.itemName;

       this.accessableInteractiveELements = [];

       this.initialized = false;

       this.initObj.detailedView.addVLabItem(this);
       this.parent = this.initObj.detailedView;

       this.renderFrameCurTime = 0;
       this.renderFramePrevTime = 0;

       this.refrigerantAnimationStarted = false;
       this.refrigerantFlowThrottling = 4;
       this.refrigerantFlowThrottlingCnt = 0;

       this.workAnimation = {
           bulbGasRed: 0.0,
           prevBulbGasRed: 0.0
       };

       this.initialize();
    }

    initialize() {
        return new Promise((resolve, reject) => {
            this.context.loadVLabItem("../vlabs.items/hvac/thermostaticExpansionValveR410A/thermostaticExpansionValveR410A.json", "thermostaticExpansionValveR410A").then((scene) => {
                this.model = scene.children[0];
                if (this.initObj.name) {
                    this.model.name = this.initObj.name;
                }

                this.initialized = true;
                if (this.initObj.detailedView) {
                    this.initObj.detailedView.addVLabItem(this);
                    this.parent = this.initObj.detailedView;
                } else {
                    this.context.vLabScene.add(this.model);
                    this.parent = this.context;
                }

                resolve(this);

                if (this.pos) {
                    this.model.position.copy(this.pos);
                } else {
                    console.error("ThermostaticExpansionValveR410A is not set");
                }

            }).catch(error => {
                console.error(error);
                reject('An error happened while loading VLab Item ' + this.itemName, error);
            });
        });
    }

    prepareInitialState() {
        if (!this.initialized) return;

        this.thermostaticExpansionValveR410ANormalView = this.model.getObjectByName('thermostaticExpansionValveR410ANormalView');
        this.thermostaticExpansionValveR410ACutView = this.model.getObjectByName('thermostaticExpansionValveR410ACutView');
        this.thermostaticExpansionValveR410ACutView.visible = false;

        this.txvSpringCap = this.model.getObjectByName('txvSpringCap');
        this.txvSpringCapCutView = this.model.getObjectByName('txvSpringCapCutView');
        this.txvSpringCapCutView.visible = false;

        this.txvRefrigerantFlow = this.model.getObjectByName('txvRefrigerantFlow');
        this.txvRefrigerantFlow.material.map.offset.y = 0.5;
        this.txvRefrigerantFlow.visible = false;

        this.txvRefrigerantFlowVapor = this.model.getObjectByName('txvRefrigerantFlowVapor');
        this.txvRefrigerantFlowVapor.visible = false;
        this.txvRefrigerantFlowOutletTube = this.model.getObjectByName('txvRefrigerantFlowOutletTube');
        this.txvRefrigerantFlowOutletTube.visible = false;
        this.txvRefrigerantFlowStream = this.model.getObjectByName('txvRefrigerantFlowStream');
        this.txvRefrigerantFlowStream.material.depthTest = false;
        this.txvRefrigerantFlowStream.visible = false;

        this.txvSensingBulbGas = this.model.getObjectByName('txvSensingBulbGas');
        this.txvSpringPlate = this.model.getObjectByName('txvSpringPlate');
        this.txvSpringPlateInitialZPosition = this.txvSpringPlate.position.z;
        this.txvMembrane = this.model.getObjectByName('txvMembrane');
        this.txvSpring = this.model.getObjectByName('txvSpring');

        this.txvSensingBulb = this.model.getObjectByName('txvSensingBulb');
        this.txvSensingBulbCutView = this.model.getObjectByName('txvSensingBulbCutView');
        this.txvSensingBulbCutView.visible = false;

        this.txvPlunger = this.model.getObjectByName('txvPlunger');

        var textureLoader = new THREE.TextureLoader();

        Promise.all([
            textureLoader.load('../vlabs.assets/img/look-through.png'),
            textureLoader.load('../vlabs.items/hvac/thermostaticExpansionValveR410A/textures/refrigerantOnOff.png'),
            textureLoader.load('../vlabs.items/hvac/thermostaticExpansionValveR410A/textures/arrow.png'),
        ])
        .then((result) => {
            var lookThroughSpriteTexture = result[0];
            var lookThroughSpriteMaterial = new THREE.SpriteMaterial({
                map: lookThroughSpriteTexture,
                color: 0xffffff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.5,
                rotation: 0.0,
                depthTest: true,
                depthWrite: true
            });

            var lookThroughSpriteMaterialAlt1 = new THREE.SpriteMaterial({
                map: lookThroughSpriteTexture,
                color: 0xffffff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.5,
                rotation: 0.0,
                depthTest: true,
                depthWrite: true
            });

            var lookThroughSpriteMaterialAlt2 = new THREE.SpriteMaterial({
                map: lookThroughSpriteTexture,
                color: 0xffffff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.75,
                rotation: 0.0,
                depthTest: false,
                depthWrite: true
            });

            this.thermostaticExpansionValveR410ALookSprite = new THREE.Sprite(lookThroughSpriteMaterial);
            this.thermostaticExpansionValveR410ALookSprite.name = "thermostaticExpansionValveR410ALookSprite";
            this.thermostaticExpansionValveR410ALookSprite.scale.set(0.015, 0.015, 0.015);
            this.thermostaticExpansionValveR410ALookSprite.position.add(new THREE.Vector3(0.025, 0.0, 0.005));
            this.thermostaticExpansionValveR410ALookSprite.mousePressHandler = function() {
                if (this.thermostaticExpansionValveR410ANormalView.visible) {
                    this.thermostaticExpansionValveR410ACutView.visible = true;
                    this.thermostaticExpansionValveR410ANormalView.visible = false;
                    this.thermostaticExpansionValveR410ALookSprite.material.opacity = 0.1;
                    if (this.refrigerantAnimationStarted && this.txvRefrigerantHideShowSprite.material.opacity == 0.75) {
                        this.txvRefrigerantFlowStream.visible = true;
                    }
                    this.txvCapLookSprite.visible = true;
                    this.txvSensingBulbCutView.visible = true;
                    this.txvSensingBulb.visible = false;
                    this.txvRefrigerantHideShowSprite.visible = true;
                    if (this.refrigerantAnimationStarted) {
                        this.directionArrowSprite.visible = true;
                    }
                } else {
                    this.thermostaticExpansionValveR410ACutView.visible = false;
                    this.thermostaticExpansionValveR410ANormalView.visible = true;
                    this.thermostaticExpansionValveR410ALookSprite.material.opacity = 0.5;
                    this.txvRefrigerantFlowStream.visible = false;
                    this.txvCapLookSprite.visible = false;
                    this.txvSpringCap.visible = true;
                    this.txvSpringCapCutView.visible = false;
                    lookThroughSpriteMaterialAlt1.opacity = 0.5;
                    this.txvSensingBulbCutView.visible = false;
                    this.txvSensingBulb.visible = true;
                    this.txvRefrigerantHideShowSprite.visible = false;
                    this.directionArrowSprite.visible = false;
                }
            };
            this.model.add(this.thermostaticExpansionValveR410ALookSprite);
            this.thermostaticExpansionValveR410ALookSprite.visible = true;
            this.accessableInteractiveELements.push(this.thermostaticExpansionValveR410ALookSprite);



            this.txvCapLookSprite = new THREE.Sprite(lookThroughSpriteMaterialAlt1);
            this.txvCapLookSprite.name = "txvCapLookSprite";
            this.txvCapLookSprite.scale.set(0.005, 0.005, 0.005);
            this.txvCapLookSprite.position.add(new THREE.Vector3(0.01, 0.0, 0.015));
            this.txvCapLookSprite.mousePressHandler = function() {
                if (this.txvSpringCap.visible) {
                    this.txvSpringCap.visible = false;
                    this.txvSpringCapCutView.visible = true;
                    lookThroughSpriteMaterialAlt1.opacity = 0.2;
                } else {
                    this.txvSpringCap.visible = true;
                    this.txvSpringCapCutView.visible = false;
                    lookThroughSpriteMaterialAlt1.opacity = 0.5;
                }
            };
            this.model.add(this.txvCapLookSprite);
            this.txvCapLookSprite.visible = false;
            this.accessableInteractiveELements.push(this.txvCapLookSprite);


            this.txvRefrigerantHideShowSprite = new THREE.Sprite(lookThroughSpriteMaterialAlt2);
            this.txvRefrigerantHideShowSprite.name = "txvRefrigerantHideShowSprite";
            this.txvRefrigerantHideShowSprite.scale.set(0.005, 0.005, 0.005);
            this.txvRefrigerantHideShowSprite.position.add(new THREE.Vector3(0.0, 0.035, 0.0235));
            this.txvRefrigerantHideShowSprite.mousePressHandler = function() {
                if (lookThroughSpriteMaterialAlt2.opacity == 0.75) {
                    lookThroughSpriteMaterialAlt2.opacity = 0.25;
                    this.txvRefrigerantFlowOutletTube.visible = false;
                    this.txvRefrigerantFlowStream.visible = false;
                    this.txvRefrigerantFlowVapor.visible = false;
                    this.txvRefrigerantFlow.visible = false;
                } else {
                    lookThroughSpriteMaterialAlt2.opacity = 0.75;
                    this.txvRefrigerantFlowOutletTube.visible = true;
                    this.txvRefrigerantFlowStream.visible = true;
                    this.txvRefrigerantFlowVapor.visible = true;
                    this.txvRefrigerantFlow.visible = true;
                }
            };
            this.model.add(this.txvRefrigerantHideShowSprite);
            this.txvRefrigerantHideShowSprite.visible = false;
            this.accessableInteractiveELements.push(this.txvRefrigerantHideShowSprite);


            var refrigerantOnOffTexture = result[1];
            var refrigerantOnOffSpriteMaterial = new THREE.SpriteMaterial({
                map: refrigerantOnOffTexture,
                color: 0xffffff,
                blending: THREE.NormalBlending,
                transparent: true,
                opacity: 1.0,
                rotation: 0.0,
                depthTest: true,
                depthWrite: true
            });

            this.refrigerantOnOffSprite = new THREE.Sprite(refrigerantOnOffSpriteMaterial);
            this.refrigerantOnOffSprite.name = "refrigerantOnOffSprite";
            this.refrigerantOnOffSprite.scale.set(0.015, 0.015, 0.015);
            this.refrigerantOnOffSprite.position.add(new THREE.Vector3(0.0, -0.045, 0.102));
            this.refrigerantOnOffSprite.mousePressHandler = function() {
                if (this.refrigerantOnOffSprite.material.opacity == 1.0) {
                    this.refrigerantOnOffSprite.material.opacity = 0.25;
                    this.refrigerantOnOffSprite.position.add(new THREE.Vector3(0.0, 0.0, 0.028));
                    this.startRefrigerantAnimation();
                    if (this.bulbGasAnimation !== undefined) this.bulbGasAnimation.stop();
                    this.bulbGasAnimation = new TWEEN.Tween(this.workAnimation)
                    .to({ bulbGasRed: 1.0 }, 10000)
                    .easing(TWEEN.Easing.Linear.None)
                    .repeat(Infinity)
                    .yoyo(true)
                    .start();
                    this.bulbGasAnimation.prevBulbGasRed = this.bulbGasAnimation.bulbGasRed;
                    if (this.thermostaticExpansionValveR410ACutView.visible) {
                        this.directionArrowSprite.visible = true;
                    }
                } else {
                    if (this.bulbGasAnimation !== undefined) this.bulbGasAnimation.stop();
                    this.workAnimation.bulbGasRed = 0.0;
                    this.refrigerantOnOffSprite.material.opacity = 1.0;
                    this.refrigerantOnOffSprite.position.add(new THREE.Vector3(0.0, 0.0, -0.028));
                    this.stopRefrigerantAnimation();
                }
            };
            this.model.add(this.refrigerantOnOffSprite);
            this.refrigerantOnOffSprite.visible = true;
            this.accessableInteractiveELements.push(this.refrigerantOnOffSprite);


            var directionArrowSpriteTexture = result[2];
            var directionArrowSpriteMaterial = new THREE.SpriteMaterial({
                map: directionArrowSpriteTexture,
                color: 0xffffff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.85,
                rotation: 0.0,
                depthTest: false,
                depthWrite: true
            });

            this.directionArrowSprite = new THREE.Sprite(directionArrowSpriteMaterial);
            this.directionArrowSprite.name = "directionArrowSprite";
            this.directionArrowSprite.scale.set(0.005, 0.005, 0.005);
            this.directionArrowSprite.position.add(new THREE.Vector3(0.0, 0.0, 0.02));
            this.txvPlunger.add(this.directionArrowSprite);
            this.directionArrowSprite.visible = false;
        });
    }

    onReleaseGesture() {
        // if (this.initObj.detailedView) {
        //     this.initObj.detailedView.clearSelection();
        // }
        this.parent.iteractionRaycaster.setFromCamera(this.parent.mouseCoordsRaycaster, this.parent.defaultCamera);
        var interactionObjectIntersects = this.parent.iteractionRaycaster.intersectObjects(this.accessableInteractiveELements);

        if (interactionObjectIntersects.length > 0) {
            if (interactionObjectIntersects[0].object.mousePressHandler) {
                interactionObjectIntersects[0].object.mousePressHandler.call(this);
            }
        }
    }

    onDetailedViewRenderFrameEvent(event) {
        TWEEN.update(event.curTime);
        this.renderFrameCurTime = event.curTime;
        if (this.refrigerantAnimationStarted) {
            this.txvSensingBulbGas.material.color =  new THREE.Color(this.workAnimation.bulbGasRed, 0.0, 1.0 - this.workAnimation.bulbGasRed / 4);
            this.txvSensingBulbGas.scale.z = 1.0 + this.workAnimation.bulbGasRed / 8;
            this.txvMembrane.scale.z = 0.5 + this.workAnimation.bulbGasRed / 2;
            this.txvSpringPlate.position.z = this.txvSpringPlateInitialZPosition - this.workAnimation.bulbGasRed / 750;

            this.txvSpring.scale.z = 1.15 - this.workAnimation.bulbGasRed / 16;

            this.txvRefrigerantFlowStream.material.opacity = this.workAnimation.bulbGasRed;
            this.txvRefrigerantFlowOutletTube.material.opacity = this.workAnimation.bulbGasRed;

            this.txvRefrigerantFlowVapor.material.map.offset.x += -0.005;
            if (this.txvRefrigerantFlowVapor.material.map.offset.y > 0.5) {
                this.txvRefrigerantFlowVapor.material.map.offset.y = 0.0;
            } else {
                this.txvRefrigerantFlowVapor.material.map.offset.y += Math.random() / 5;
            }
            this.txvRefrigerantFlowVapor.rotateZ(Math.random() / 5);
            if (this.txvRefrigerantFlowVapor.scale.z > 1.05) {
                this.txvRefrigerantFlowVapor.scale.z = 0.85;
            } else {
                this.txvRefrigerantFlowVapor.scale.z += 0.02;
            }

            if (this.txvRefrigerantFlowStream.visible) {
                this.refrigerantFlowThrottlingCnt++;
                if (this.refrigerantFlowThrottlingCnt > this.refrigerantFlowThrottling) {
                    this.txvRefrigerantFlowStream.material.map.offset.y -= 0.038;
                    if (this.txvRefrigerantFlowStream.material.map.offset.y < -0.494) {
                        this.txvRefrigerantFlowStream.material.map.offset.y = -0.038;
                    }
                    this.refrigerantFlowThrottlingCnt = 0;
                }
            }

            if (this.workAnimation.bulbGasRed > 0.05) {
                this.txvRefrigerantFlow.material.map.offset.y = 0.0;
                if (this.renderFrameCurTime - this.renderFramePrevTime > 175 - this.workAnimation.bulbGasRed * 50) {
                    if (this.txvRefrigerantFlow.material.map.offset.x > 0.5) {
                        this.txvRefrigerantFlow.material.map.offset.x = 0.0;
                    } else {
                        this.txvRefrigerantFlow.material.map.offset.x += 0.263;
                    }
                    this.renderFramePrevTime = this.renderFrameCurTime;
                }
            } else {
                this.txvRefrigerantFlow.material.map.offset.y = 0.5;
            }

            if (this.workAnimation.prevBulbGasRed > this.workAnimation.bulbGasRed) {
                if (this.directionArrowSprite.material.rotation == 0.0) {
                    this.directionArrowSprite.material.rotation = THREE.Math.degToRad(180.0);
                }
            } else {
                if (this.directionArrowSprite.material.rotation == THREE.Math.degToRad(180.0)) {
                    this.directionArrowSprite.material.rotation = 0.0;
                }
            }
            this.workAnimation.prevBulbGasRed = this.workAnimation.bulbGasRed;
        }
    }

    startRefrigerantAnimation() {
        this.renderFramePrevTime = this.renderFrameCurTime;
        this.refrigerantAnimationStarted = true;
        this.txvRefrigerantFlow.visible = true;
        this.txvRefrigerantFlowVapor.visible = true;
        this.txvRefrigerantFlow.material.map.offset.y = 0.0;
        this.txvRefrigerantFlowOutletTube.visible = true;
        this.txvRefrigerantFlowVapor.scale.z = 0.85;
        if (this.thermostaticExpansionValveR410ACutView.visible == true) {
            this.txvRefrigerantFlowStream.visible = true;
        }
    }

    stopRefrigerantAnimation() {
        this.refrigerantAnimationStarted = false;
        this.txvRefrigerantFlow.visible = false;
        this.txvRefrigerantFlow.material.map.offset.y = 0.5;
        this.txvRefrigerantFlowVapor.visible = false;
        this.txvRefrigerantFlowVapor.material.map.offset.x = 0.0;
        this.txvRefrigerantFlowOutletTube.visible = false;
        this.txvRefrigerantFlowStream.visible = false;
    }

    onOpen() {
    }

    onClose() {
    }
}