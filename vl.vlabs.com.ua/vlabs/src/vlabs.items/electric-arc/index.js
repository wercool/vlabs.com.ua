import * as THREE           from 'three';
import * as StringUtils         from '../../vlabs.core/utils/string.utils.js';

export default class ElectricArc {
    constructor(initObj) {
        this.initObj = initObj;
        this.context = this.initObj.context;
        this.clock = new THREE.Clock();

        var textureLoader = new THREE.TextureLoader();

        Promise.all([
            textureLoader.load('../vlabs.items/electric-arc/assets/spark-arc.png'),
        ])
        .then((result) => {
            this.sparkArkTexture = result[0];

            this.initializeEffect();
        })
        .catch(error => {
            console.error(error);
        });
    }

    initializeEffect() {
        var self = this;

        this.effectSpriteMaterial = new THREE.SpriteMaterial({
            map: this.sparkArkTexture,
            color: this.initObj.color ? this.initObj.color : 0xffffff,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: this.initObj.opacity ? this.initObj.opacity : 0.5,
            rotation: this.initObj.rotation ? this.initObj.rotation : 0.0,
            depthTest: this.initObj.inDepthTest ? this.initObj.inDepthTest : true,
            depthWrite: this.initObj.inDepthTest ? this.initObj.inDepthTest : true
        });

        this.effectSprite = new THREE.Sprite(this.effectSpriteMaterial);
        this.effectSprite.name = "ElectricArcSprite_" + StringUtils.getRandomString(8);
        this.effectSprite.scale.copy(this.initObj.scale ? this.initObj.scale : new THREE.Vector3(1.0, 1.0, 1.0));
        this.effectSprite.visible = false;
        this.effectSprite.userData['resetCnt'] = 0;

        this.effectLight = new THREE.PointLight(0x000000);
        // this.effectLight = new THREE.DirectionalLight(0x000000);
        if (this.initObj.lightning) {
            this.effectLight.intensity = this.initObj.lightning.intensity;
            this.effectLight.distance = this.initObj.lightning.distance;
            this.effectLight.decay = this.initObj.lightning.decay;
            this.context.vLabScene.add(this.effectLight);
            this.effectLight.visible = false;
            if (this.initObj.parentObj !== undefined) {
                this.initObj.parentObj.add(this.effectLight);
                if (this.initObj.relPos) {
                    this.effectLight.position.add(this.initObj.relPos);
                }
                this.effectLight.position.add(this.initObj.lightning.relPos);
            }
            // this.effectLight.target = this.initObj.lightning.target;
        }

        if (this.initObj.parentObj !== undefined) {
            this.initObj.parentObj.add(this.effectSprite);
            if (this.initObj.relPos) {
                this.effectSprite.position.add(this.initObj.relPos);
            }
        } else {
            // TODO: add to the this.context.vLabScene at pos
        }

        if (this.initObj.scale) {
            this.effectSprite.scale.set(this.initObj.scale, this.initObj.scale, 1);
        }

        // Sounds
        var audioLoader = new THREE.AudioLoader();
        audioLoader.load('../vlabs.items/electric-arc/sounds/arcSnd1.mp3', function(buffer) {
            self.arcSound = new THREE.Audio(self.context.defaultAudioListener);
            self.arcSound.setBuffer(buffer);
            self.arcSound.setVolume(0.25);
            self.arcSound.setLoop(true);
        });
    }

    start() {
        if (this.effectSprite == undefined || this.arcSound == undefined) {
            setTimeout(this.start.bind(this), 250);
            return;
        }
        //VLab events subscribers
        this.context.webGLContainerEventsSubcribers.renderframe["ElectricArcEffect" + this.initObj.name + "vLabSceneRenderFrame"] = 
        {
            callback: this.onRedererFrameEvent,
            instance: this
        };
        this.effectSprite.visible = true;
        this.effectLight.visible = true;
        this.arcSound.play();
    }

    stop() {
        this.effectSprite.visible = false;
        this.effectLight.visible = false;
        delete this.context.webGLContainerEventsSubcribers.renderframe["ElectricArcEffect" + this.initObj.name + "vLabSceneRenderFrame"];
        this.arcSound.stop();
    }

    onRedererFrameEvent(event) {
        this.effectSprite.material.rotation = Math.random();
        this.effectSprite.material.color.add(new THREE.Color(Math.random(), 0.0, Math.random() * 10));
        this.effectSprite.userData['resetCnt'] += 1;
        if (this.effectSprite.userData['resetCnt'] > 2) {
            this.effectSprite.material.color = new THREE.Color(0xffffff);
            this.effectSprite.userData['resetCnt'] = 0;
        }
        this.effectSprite.material.needsUpdate = true;
        if (this.effectLight.intensity > 1.0) {
            this.effectLight.intensity = 1.0;
        }
        this.effectLight.intensity += 5;
        this.effectLight.color = this.effectSprite.material.color;
        // if (this.arcSound.isPlaying) {
        //     this.arcSound.stop();
        // } else {
        //     this.arcSound.play();
        // }
    }
}