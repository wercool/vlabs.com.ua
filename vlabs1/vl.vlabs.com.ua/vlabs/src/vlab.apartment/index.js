import * as THREE           from 'three';
import VLab                 from '../vlabs.core/vlab';
import VLabPositioner       from '../vlabs.core/vlab-positioner';
import Valter               from '../vlabs.items/valter';

class VlabApartment extends VLab {
    constructor(initObj = {}) {
        super(initObj);

        addEventListener(this.name + "SceneCompleteEvent", this.onSceneCompleteEvent.bind(this), false);
        addEventListener(this.name + "ActivatedEvent", this.onActivatedEvent.bind(this), false);
        addEventListener(this.name + "RedererFrameEvent",  this.onRedererFrameEvent.bind(this), false);

        document.addEventListener("keydown", this.onKeyDown.bind(this), false);

        super.preInitialize().then(() => {
            super.initialize().then((success) => {
                if (success) {
                    var textureLoader = new THREE.TextureLoader();

                    Promise.all([
                        textureLoader.load('../vlabs.assets/effectmaps/lampHalo.png'),
                    ])
                    .then((result) => {
                        this.lampHalo = result[0];

                        this.initialize(initObj);
                    })
                    .catch(error => {
                        console.error(error);
                    });
                }
            });
        }).catch(error => {
            console.error(error.error);
            this.showErrorMessage(error);
        });
    }

    initialize() {
        this.loadScene().then((vLabScene) => {
            this.setVLabScene(vLabScene);

        }).catch(error => {
            console.error(error);
            this.showErrorMessage(error);
        });
    }

    onKeyDown(event) {
        switch (event.keyCode) {
            case 79: // o
                this.switchCameraControls({ type: 'orbit' });
            break;
            case 80: // p
            case 32: // whitespace
                this.switchCameraControls({ type: 'pointerlock'});
            break;
        }
    }

    onSceneCompleteEvent(event) {
        super.activate();
        super.switchCameraControls(this.nature.cameraControls);
    }

    onActivatedEvent() {
        console.log("Apartment VLab activated");

        var defaultCameraPos = this.getWorldPosition(this.defaultCamera);
        this.prevDefaultCameraPos = defaultCameraPos;

        var light0 = new THREE.AmbientLight(0xffffff, 0.45);
        this.vLabScene.add(light0);

        // this.PointLight1 = new THREE.PointLight(0xffffff, 1.0);
        // this.PointLight1.position.set(0.0, 6.0, 1.0);
        // this.vLabScene.add(this.PointLight1);

        this.SpotLight1 = new THREE.PointLight(0xffffff, 0.4);
        this.SpotLight1.position.set(defaultCameraPos.x, 2.95, defaultCameraPos.z);
        this.vLabScene.add(this.SpotLight1);

        this.ceiling = this.vLabScene.getObjectByName('ceiling');
        // this.ceiling.material.color = new THREE.Color(1.1, 1.1, 1.1);
        this.ceiling.material.depthTest = false;
        this.ceiling.material.needsUpdate = true;

        this.lampHaloSpriteMaterial = new THREE.SpriteMaterial({
            map: this.lampHalo,
            transparent: true,
            opacity: 0.75,
            rotation: 0.0,
            depthTest: true,
            depthWrite: true,
            color: 0xfffef3,
            // blending: THREE.AdditiveBlending
        });
        this.kitchenLampHaloSprite1 = new THREE.Sprite(this.lampHaloSpriteMaterial);
        this.kitchenLampHaloSprite1.scale.set(0.75, 0.75, 0.75);
        this.kitchenLampHaloSprite1.position.copy(new THREE.Vector3(0.0, 0.0, -0.01));
        this.ceiling.add(this.kitchenLampHaloSprite1);
        this.kitchenLampHaloSprite2 = new THREE.Sprite(this.lampHaloSpriteMaterial);
        this.kitchenLampHaloSprite2.scale.set(0.75, 0.75, 0.75);
        this.kitchenLampHaloSprite2.position.copy(new THREE.Vector3(0.953, -0.721, -0.01));
        this.ceiling.add(this.kitchenLampHaloSprite2);
        this.kitchenLampHaloSprite3 = new THREE.Sprite(this.lampHaloSpriteMaterial);
        this.kitchenLampHaloSprite3.scale.set(0.75, 0.75, 0.75);
        this.kitchenLampHaloSprite3.position.copy(new THREE.Vector3(0.953, 0.858, -0.01));
        this.ceiling.add(this.kitchenLampHaloSprite3);
        this.kitchenLampHaloSprite4 = new THREE.Sprite(this.lampHaloSpriteMaterial);
        this.kitchenLampHaloSprite4.scale.set(0.75, 0.75, 0.75);
        this.kitchenLampHaloSprite4.position.copy(new THREE.Vector3(-0.781, -0.721, -0.01));
        this.ceiling.add(this.kitchenLampHaloSprite4);
        this.kitchenLampHaloSprite5 = new THREE.Sprite(this.lampHaloSpriteMaterial);
        this.kitchenLampHaloSprite5.scale.set(0.75, 0.75, 0.75);
        this.kitchenLampHaloSprite5.position.copy(new THREE.Vector3(-0.781, 0.858, -0.01));
        this.ceiling.add(this.kitchenLampHaloSprite5);

        this.Valter = new Valter({
            context: this,
            pos: new THREE.Vector3(0, 0, 1.0),
            name: "Valter",
            manipulation: true
        });

        this.kitchenLocation1 = new VLabPositioner({
            context: this,
            active: false,
            pos: new THREE.Vector3(-1.0, 1.6, 1.0),
            name: 'kitchenLocation1',
            scale: new THREE.Vector3(0.2, 0.2, 0.2),
            target: new THREE.Vector3(-0.95, 1.6, 1.05),
            completeCallBack: () => {
                this.kitchenLocation2Reversed.setVisible(false);
                this.kitchenLocation2.setVisible(true);
            }
        });

        this.kitchenLocation2 = new VLabPositioner({
            context: this,
            active: false,
            pos: new THREE.Vector3(1.02, 1.6, 2.38),
            name: 'kitchenLocation2',
            scale: new THREE.Vector3(0.2, 0.2, 0.2),
            target: new THREE.Vector3(1.07, 1.6, 2.38),
        });

        this.kitchenLocation2Reversed = new VLabPositioner({
            context: this,
            active: false,
            pos: new THREE.Vector3(1.02, 1.6, 2.38),
            name: 'kitchenLocation2Reversed',
            scale: new THREE.Vector3(0.2, 0.2, 0.2),
            target: new THREE.Vector3(1.0, 1.6, 2.38),
            visibility: false,
            completeCallBack: () => {
                this.corridorPosition1.setVisible(true);
                this.corridorPosition1Reversed.setVisible(false);
            }
        });

        this.corridorPosition1 = new VLabPositioner({
            context: this,
            active: false,
            pos: new THREE.Vector3(3.8, 1.6, 2.5),
            name: 'corridorPosition1',
            scale: new THREE.Vector3(0.2, 0.2, 0.2),
            target: new THREE.Vector3(3.8, 1.6, 2.55),
            completeCallBack: () => {
                this.kitchenLocation2.setVisible(false);
                this.kitchenLocation2Reversed.setVisible(true);
            }
        });

        this.corridorPosition1Reversed = new VLabPositioner({
            context: this,
            active: false,
            pos: new THREE.Vector3(3.8, 1.6, 2.5),
            name: 'corridorPosition1Reversed',
            scale: new THREE.Vector3(0.2, 0.2, 0.2),
            target: new THREE.Vector3(3.8, 1.6, 2.45),
            visibility: false
        });

        this.corridorPosition2 = new VLabPositioner({
            context: this,
            active: false,
            pos: new THREE.Vector3(3.8, 1.6, 4.0),
            name: 'corridorPosition2',
            scale: new THREE.Vector3(0.2, 0.2, 0.2),
            target: new THREE.Vector3(3.8, 1.6, 4.05),
            completeCallBack: () => {
                this.corridorPosition1.setVisible(false);
                this.corridorPosition1Reversed.setVisible(true);
            }
        });
    }

    onRedererFrameEvent(event) {
        var defaultCameraPos = this.getWorldPosition(this.defaultCamera);
        if (!this.prevDefaultCameraPos.equals(defaultCameraPos)) {
            this.prevDefaultCameraPos = defaultCameraPos;
            this.SpotLight1.position.set(defaultCameraPos.x, 2.95, defaultCameraPos.z);
        }
    }

}

let vlabApartment = new VlabApartment({
    "natureURL": "./resources/nature.json",
    "webGLContainer": "webGLContainer"
});