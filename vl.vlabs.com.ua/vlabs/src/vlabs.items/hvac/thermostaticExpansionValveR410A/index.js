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

        var textureLoader = new THREE.TextureLoader();

        Promise.all([
            textureLoader.load('../vlabs.assets/img/look-through.png'),
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

            this.thermostaticExpansionValveR410ALookSprite = new THREE.Sprite(lookThroughSpriteMaterial);
            this.thermostaticExpansionValveR410ALookSprite.name = "thermostaticExpansionValveR410ALookSprite";
            this.thermostaticExpansionValveR410ALookSprite.scale.set(0.015, 0.015, 0.015);
            this.thermostaticExpansionValveR410ALookSprite.position.add(new THREE.Vector3(0.025, 0.0, 0.005));
            this.thermostaticExpansionValveR410ALookSprite.mousePressHandler = function() {
                if (this.thermostaticExpansionValveR410ANormalView.visible) {
                    this.thermostaticExpansionValveR410ACutView.visible = true;
                    this.thermostaticExpansionValveR410ANormalView.visible = false;
                    this.thermostaticExpansionValveR410ALookSprite.material.opacity = 0.1;
                } else {
                    this.thermostaticExpansionValveR410ACutView.visible = false;
                    this.thermostaticExpansionValveR410ANormalView.visible = true;
                    this.thermostaticExpansionValveR410ALookSprite.material.opacity = 0.5;
                }
            };
            this.model.add(this.thermostaticExpansionValveR410ALookSprite);
            this.thermostaticExpansionValveR410ALookSprite.visible = true;
            this.accessableInteractiveELements.push(this.thermostaticExpansionValveR410ALookSprite);
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
    }


    onOpen() {
    }

    onClose() {
    }
}