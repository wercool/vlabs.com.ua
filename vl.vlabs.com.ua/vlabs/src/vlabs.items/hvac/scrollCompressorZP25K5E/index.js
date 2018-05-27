import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';
import VLab                 from '../../../vlabs.core/vlab';

export default class ScrollCompressorZP25K5E {
    /*
    initObj {
        "context": VLab,
    }
    */
    constructor(initObj) {
       this.initObj = initObj;
       this.context = initObj.context;
       this.pos = initObj.pos;

       this.itemName = this.initObj.itemName;

       this.accessableInteractiveELements = [];

       this.initialized = false;

       this.initObj.detailedView.addVLabItem(this);
       this.parent = this.initObj.detailedView;

       this.assetsReady = false;

    //    this.initialize();
    }

    initialize() {
        var self = this;
        return new Promise((resolve, reject) => {
            this.context.loadVLabItem("../vlabs.items/hvac/scrollCompressorZP25K5E/scrollCompressorZP25K5E-PFV-830.json", "scrollCompressorZP25K5E").then((scene) => {

                this.model = scene.children[0];
                if (this.initObj.name) {
                    this.model.name = this.initObj.name;
                }

                this.initialized = true;
                if (this.initObj.detailedView) {
                    this.initObj.detailedView.addVLabItem(this);
                    this.parent = this.initObj.detailedView;

                    if (this.parent.scene.animations) {
                        this.parent.scene.animations.push(scene.animations[0]);
                    } else {
                        this.parent.scene.animations = scene.animations;
                    }
                    this.animationClip = this.parent.scene.animations[0];
                    this.animationAnimationMixer = new THREE.AnimationMixer(this.parent.scene);
                    this.animationAction = this.animationAnimationMixer.clipAction(this.animationClip);
                    this.animationAction.timeScale = 100.0;

                    this.scrollCompressorSound = new THREE.Audio(this.parent.defaultAudioListener);
                    var audioLoader = new THREE.AudioLoader();
                    audioLoader.load('../vlabs.items/hvac/scrollCompressorZP25K5E/sounds/sound1.mp3', function(buffer) {
                        self.scrollCompressorSound.setBuffer(buffer);
                        self.scrollCompressorSound.setLoop(true);
                        self.scrollCompressorSound.setVolume(0.05);
                        self.scrollCompressorSound.play();
                        self.animationAction.play();
                        self.assetsReady = true;
                    });

                } else {
                    this.context.vLabScene.add(this.model);
                    this.parent = this.context;
                }

                resolve(this);

                if (this.pos) {
                    this.model.position.copy(this.pos);
                } else {
                    console.error("Control Board CEBD430433is not set");
                }

            }).catch(error => {
                console.error(error);
                reject('An error happened while loading VLab Item ' + this.itemName, error);
            });
        });
    }

    setupEnvMaterials(materialsObj) {
        if (!this.initialized) return;

        var scrollCompressorZP25K5EEnclosure = this.model.parent.getObjectByName("scrollCompressorZP25K5EEnclosure");
        scrollCompressorZP25K5EEnclosure.material.envMap = materialsObj.envMap;
        scrollCompressorZP25K5EEnclosure.material.combine = THREE.MixOperation;
        scrollCompressorZP25K5EEnclosure.material.reflectivity = 0.1;
        scrollCompressorZP25K5EEnclosure.material.needsUpdate = true;

        var scrollCompressorZP25K5EEnclosureCutView = this.model.parent.getObjectByName("scrollCompressorZP25K5EEnclosureCutView");
        scrollCompressorZP25K5EEnclosureCutView.material.envMap = materialsObj.envMap;
        scrollCompressorZP25K5EEnclosureCutView.material.combine = THREE.MixOperation;
        scrollCompressorZP25K5EEnclosureCutView.material.reflectivity = 0.1;
        scrollCompressorZP25K5EEnclosureCutView.material.needsUpdate = true;
    }

    prepareInitialState() {
        if (!this.initialized) return;

        this.scrollCompressorZP25K5E = this.model.parent.getObjectByName("scrollCompressorZP25K5E");
        this.scrollCompressorZP25K5E.rotateZ(Math.PI / 2);

        this.scrollCompressorZP25K5EEnclosureCutView = this.model.parent.getObjectByName("scrollCompressorZP25K5EEnclosureCutView");
        this.scrollCompressorZP25K5EEnclosureCutView.visible = false;

        this.scrollCompressorZP25K5EEnclosure = this.model.parent.getObjectByName("scrollCompressorZP25K5EEnclosure");

        var textureLoader = new THREE.TextureLoader();

        Promise.all([
            textureLoader.load('../vlabs.assets/img/look-through.png'),
            textureLoader.load('../vlabs.assets/img/exploded-view.png'),
        ])
        .then((result) => {
            var lookThroughSpriteTexture = result[0];
            var lookThroughSpriteMaterial = new THREE.SpriteMaterial({
                map: lookThroughSpriteTexture,
                color: 0xffffff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.45,
                rotation: 0.0,
                depthTest: true,
                depthWrite: true
            });

            this.scrollCompressorZP25K5EEnclosureLookSprite = new THREE.Sprite(lookThroughSpriteMaterial);
            this.scrollCompressorZP25K5EEnclosureLookSprite.name = "scrollCompressorZP25K5EEnclosureLookSprite";
            this.scrollCompressorZP25K5EEnclosureLookSprite.scale.set(0.05, 0.05, 0.05);
            this.scrollCompressorZP25K5EEnclosureLookSprite.position.x += 0.0;
            this.scrollCompressorZP25K5EEnclosureLookSprite.position.y += 0.1;
            this.scrollCompressorZP25K5EEnclosureLookSprite.position.z += 0.1;
            this.scrollCompressorZP25K5EEnclosureLookSprite.mousePressHandler = function() {
                if (this.scrollCompressorZP25K5EEnclosure.visible) {
                    this.scrollCompressorZP25K5EEnclosureCutView.visible = true;
                    this.scrollCompressorZP25K5EEnclosure.visible = false;
                    this.scrollCompressorZP25K5EEnclosureLookSprite.material.opacity = 0.1;
                    this.scrollCompressorSound.setVolume(1.0);
                } else {
                    this.scrollCompressorZP25K5EEnclosureCutView.visible = false;
                    this.scrollCompressorZP25K5EEnclosure.visible = true;
                    this.scrollCompressorZP25K5EEnclosureLookSprite.material.opacity = 0.45;
                    this.scrollCompressorSound.setVolume(0.05);
                }
            };
            this.model.add(this.scrollCompressorZP25K5EEnclosureLookSprite);
            this.scrollCompressorZP25K5EEnclosureLookSprite.visible = true;
            this.accessableInteractiveELements.push(this.scrollCompressorZP25K5EEnclosureLookSprite);

            var explodedViewSpriteTexture = result[1];
            var explodedViewSpriteMaterial = new THREE.SpriteMaterial({
                map: explodedViewSpriteTexture,
                color: 0xffffff,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity: 0.45,
                rotation: 0.0,
                depthTest: true,
                depthWrite: true
            });

            this.assembledViewPartsPositions = {
                'scrollCompressorZP25K5EEnclosureCutView': this.model.getObjectByName('scrollCompressorZP25K5EEnclosureCutView').position.clone(),
                'scrollCompressorZP25K5EFixedScrollPlunger': this.model.getObjectByName('scrollCompressorZP25K5EFixedScrollPlunger').position.clone(),
                'scrollCompressorZP25K5EFixedScroll': this.model.getObjectByName('scrollCompressorZP25K5EFixedScroll').position.clone(),
                'scrollCompressorZP25K5ERotorTopFixture': this.model.getObjectByName('scrollCompressorZP25K5ERotorTopFixture').position.clone(),
                'boltHead8mm.000': this.model.getObjectByName('boltHead8mm.000').position.clone(),
                'boltHead8mm.001': this.model.getObjectByName('boltHead8mm.001').position.clone(),
                'boltHead8mm.002': this.model.getObjectByName('boltHead8mm.002').position.clone(),
                'boltHead8mm.003': this.model.getObjectByName('boltHead8mm.003').position.clone(),
                'scrollCompressorZP25K5EBearingPlate': this.model.getObjectByName('scrollCompressorZP25K5EBearingPlate').position.clone(),
                'scrollCompressorZP25K5EBottomBearing': this.model.getObjectByName('scrollCompressorZP25K5EBottomBearing').position.clone(),
                'boltHead5mm1': this.model.getObjectByName('boltHead5mm1').position.clone(),
                'boltHead5mm2': this.model.getObjectByName('boltHead5mm2').position.clone(),
                'boltHead5mm3': this.model.getObjectByName('boltHead5mm3').position.clone(),
                'scrollCompressorZP25K5EBottomBearingFixture': this.model.getObjectByName('scrollCompressorZP25K5EBottomBearingFixture').position.clone(),
                'scrollCompressorZP25K5EStator': this.model.getObjectByName('scrollCompressorZP25K5EStator').position.clone(),
                'ZP25K5ECompressorPlug': this.model.getObjectByName('ZP25K5ECompressorPlug').position.clone(),
            };

            this.scrollCompressorZP25K5ExplodedViewSprite = new THREE.Sprite(explodedViewSpriteMaterial);
            this.scrollCompressorZP25K5ExplodedViewSprite.name = "scrollCompressorZP25K5ExplodedViewSprite";
            this.scrollCompressorZP25K5ExplodedViewSprite.scale.set(0.05, 0.05, 0.05);
            this.scrollCompressorZP25K5ExplodedViewSprite.position.x += 0.0;
            this.scrollCompressorZP25K5ExplodedViewSprite.position.y += 0.0;
            this.scrollCompressorZP25K5ExplodedViewSprite.position.z += 0.45;
            this.scrollCompressorZP25K5ExplodedViewSprite.mousePressHandler = function() {
                if (this.scrollCompressorZP25K5ExplodedViewSprite.material.opacity == 0.45) {
                    this.scrollCompressorZP25K5ExplodedViewSprite.material.opacity = 0.25;
                    this.scrollCompressorZP25K5EEnclosureLookSprite.visible = false;
                    this.scrollCompressorZP25K5EEnclosureCutView.visible = true;
                    this.scrollCompressorZP25K5EEnclosure.visible = false;
                    this.scrollCompressorSound.setVolume(0.5);


                    this.animationAction.timeScale = 25.0;
                    this.scrollCompressorSound.stop();

                    this.model.getObjectByName('scrollCompressorZP25K5ERotorInsert').scale.x = 0.75;
                    this.model.getObjectByName('scrollCompressorZP25K5ERotorInsert').scale.y = 0.75;

                    new TWEEN.Tween(this.model.getObjectByName('scrollCompressorZP25K5EEnclosureCutView').position)
                    .to({ y: this.assembledViewPartsPositions['scrollCompressorZP25K5EEnclosureCutView'].y - 0.2 }, 500)
                    .easing(TWEEN.Easing.Linear.None)
                    .onComplete(() => {

                        new TWEEN.Tween(this.model.getObjectByName('ZP25K5ECompressorPlug').position)
                        .to({ y: this.assembledViewPartsPositions['ZP25K5ECompressorPlug'].y - 0.2 }, 500)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();
                        new TWEEN.Tween(this.model.getObjectByName('ZP25K5ECompressorPlug').position)
                        .to({ x: this.assembledViewPartsPositions['ZP25K5ECompressorPlug'].x - 0.10 }, 500)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();

                        new TWEEN.Tween(this.model.getObjectByName('boltHead8mm.000').position)
                        .to({ z: this.assembledViewPartsPositions['boltHead8mm.000'].z + 0.2 }, 250)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();
                        new TWEEN.Tween(this.model.getObjectByName('boltHead8mm.001').position)
                        .to({ z: this.assembledViewPartsPositions['boltHead8mm.001'].z + 0.2 }, 250)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();
                        new TWEEN.Tween(this.model.getObjectByName('boltHead8mm.002').position)
                        .to({ z: this.assembledViewPartsPositions['boltHead8mm.002'].z + 0.2 }, 250)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();
                        new TWEEN.Tween(this.model.getObjectByName('boltHead8mm.003').position)
                        .to({ z: this.assembledViewPartsPositions['boltHead8mm.003'].z + 0.2 }, 250)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();

                        new TWEEN.Tween(this.model.getObjectByName('scrollCompressorZP25K5EFixedScrollPlunger').position)
                        .to({ z: this.assembledViewPartsPositions['scrollCompressorZP25K5EFixedScrollPlunger'].z + 0.15 }, 500)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();

                        new TWEEN.Tween(this.model.getObjectByName('scrollCompressorZP25K5EFixedScroll').position)
                        .to({ z: this.assembledViewPartsPositions['scrollCompressorZP25K5EFixedScroll'].z + 0.08 }, 500)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();

                        new TWEEN.Tween(this.model.getObjectByName('scrollCompressorZP25K5ERotorTopFixture').position)
                        .to({ z: this.assembledViewPartsPositions['scrollCompressorZP25K5ERotorTopFixture'].z + 0.07 }, 500)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();
                        new TWEEN.Tween(this.model.getObjectByName('scrollCompressorZP25K5ERotorTopFixture').position)
                        .to({ y: this.assembledViewPartsPositions['scrollCompressorZP25K5ERotorTopFixture'].y + 0.15 }, 500)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();

                        new TWEEN.Tween(this.model.getObjectByName('scrollCompressorZP25K5EBearingPlate').position)
                        .to({ z: this.assembledViewPartsPositions['scrollCompressorZP25K5EBearingPlate'].z - 0.25 }, 500)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();

                        new TWEEN.Tween(this.model.getObjectByName('scrollCompressorZP25K5EBottomBearing').position)
                        .to({ z: this.assembledViewPartsPositions['scrollCompressorZP25K5EBottomBearing'].z - 0.23 }, 500)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();

                        new TWEEN.Tween(this.model.getObjectByName('boltHead5mm1').position)
                        .to({ z: this.assembledViewPartsPositions['boltHead5mm1'].z - 0.23 }, 500)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();

                        new TWEEN.Tween(this.model.getObjectByName('boltHead5mm2').position)
                        .to({ z: this.assembledViewPartsPositions['boltHead5mm2'].z - 0.23 }, 500)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();

                        new TWEEN.Tween(this.model.getObjectByName('boltHead5mm3').position)
                        .to({ z: this.assembledViewPartsPositions['boltHead5mm3'].z - 0.23 }, 500)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();

                        new TWEEN.Tween(this.model.getObjectByName('scrollCompressorZP25K5EBottomBearingFixture').position)
                        .to({ z: this.assembledViewPartsPositions['scrollCompressorZP25K5EBottomBearingFixture'].z - 0.2 }, 500)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();

                        new TWEEN.Tween(this.model.getObjectByName('scrollCompressorZP25K5EStator').position)
                        .to({ z: this.assembledViewPartsPositions['scrollCompressorZP25K5EStator'].z - 0.18 }, 500)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();
                    })
                    .start();

                } else {
                    this.scrollCompressorZP25K5ExplodedViewSprite.material.opacity = 0.45;
                    this.scrollCompressorZP25K5EEnclosureLookSprite.visible = true;
                    this.scrollCompressorZP25K5EEnclosureCutView.visible = false;
                    this.scrollCompressorZP25K5EEnclosure.visible = true;
                    this.scrollCompressorSound.setVolume(0.05);

                    for (var assembledViewPartName in this.assembledViewPartsPositions) {
                        this.model.getObjectByName(assembledViewPartName).position.copy(this.assembledViewPartsPositions[assembledViewPartName]);
                    }

                    this.animationAction.timeScale = 100.0;
                    this.scrollCompressorSound.play();

                    this.model.getObjectByName('scrollCompressorZP25K5ERotorInsert').scale.x = 1.0;
                    this.model.getObjectByName('scrollCompressorZP25K5ERotorInsert').scale.y = 1.0;
                }
            };
            this.model.add(this.scrollCompressorZP25K5ExplodedViewSprite);
            this.scrollCompressorZP25K5ExplodedViewSprite.visible = true;
            this.accessableInteractiveELements.push(this.scrollCompressorZP25K5ExplodedViewSprite);
        });
    }

    onReleaseGesture() {
        this.parent.iteractionRaycaster.setFromCamera(this.parent.mouseCoordsRaycaster, this.parent.defaultCamera);
        var interactionObjectIntersects = this.parent.iteractionRaycaster.intersectObjects(this.accessableInteractiveELements);
        if (interactionObjectIntersects.length > 0) {
            if (interactionObjectIntersects[0].object.mousePressHandler) {
                interactionObjectIntersects[0].object.mousePressHandler.call(this);
            }
        }
    }

    onDetailedViewRenderFrameEvent(event) {
        this.animationAnimationMixer.update(event.clockDelta);
        TWEEN.update(event.curTime);
    }

    onOpen() {
        if (this.assetsReady) {
            this.animationAction.play();
            this.scrollCompressorSound.play();
        }
    }

    onClose() {
        this.animationAction.stop();
        this.scrollCompressorSound.stop();
    }
}