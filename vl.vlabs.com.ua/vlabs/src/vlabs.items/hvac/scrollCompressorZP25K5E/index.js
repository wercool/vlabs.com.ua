import * as THREE           from 'three';
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