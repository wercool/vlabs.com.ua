import * as THREE               from 'three';

export default class VLabInteractor {
    constructor(initObj) {
        this.initObj = initObj;

        this.context = this.initObj.context;

        var textureLoader = new THREE.TextureLoader();

        Promise.all([
            textureLoader.load('../vlabs.assets/img/interactor.png'),
        ])
        .then((result) => {
            this.handlerSpriteTexture = result[0];

            this.initialize();
        })
        .catch(error => {
            console.error(error);
        });
    }

    initialize() {
        this.handlerSpriteMaterial = new THREE.SpriteMaterial({
            map: this.handlerSpriteTexture,
            color: 0x54ff00,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.3,
            rotation: 0.0,
            depthTest: true,
            depthWrite: true
        });

        this.handlerSprite = new THREE.Sprite(this.handlerSpriteMaterial);
        this.handlerSprite.name = this.initObj.name + "VLabInteractorSprite";
        this.handlerSprite.scale.copy(this.initObj.scale ? this.initObj.scale : new THREE.Vector3(1.0, 1.0, 1.0));

        if (this.initObj.object) {
            this.initObj.object.add(this.handlerSprite);
            if (this.initObj.objectRelPos) {
                this.handlerSprite.position.add(this.initObj.objectRelPos);
            }
        } else {
            this.handlerSprite.position.copy(this.initObj.pos);
            this.context.vLabScene.add(this.handlerSprite);
        }

        //VLab events subscribers
        this.context.webGLContainerEventsSubcribers.mouseup[this.handlerSprite.name + "vLabSceneMouseUp"] = 
        {
            callback: this.onVLabSceneMouseUp,
            instance: this
        };
        this.context.webGLContainerEventsSubcribers.touchend[this.handlerSprite.name + "vLabSceneTouchEnd"] = 
        {
            callback: this.onVLabSceneTouchEnd,
            instance: this
        };
        console.log("VLabInteractor initialized");
    }


    onVLabSceneMouseUp(event) {
        // console.log("VLabLocator onVLabSceneMouseUp", event.type);
        this.interactionEvent();
    }

    onVLabSceneTouchEnd(event) {
        // console.log("VLabLocator onVLabSceneTouchEnd", event.type);
        this.interactionEvent();
    }

    interactionEvent() {
        if (!this.handlerSprite.visible || this.context.paused) {
            return;
        }

        this.context.helpersRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);

        var intersectObjects = this.context.interactivesSuppressorsObjects.slice();
        intersectObjects = intersectObjects.concat(this.handlerSprite);

        var intersects = this.context.helpersRaycaster.intersectObjects(intersectObjects);

        if (intersects.length > 0) {
            if (intersects[0].object == this.handlerSprite) {
                this.executeAction();
            }
        }
    }

    deactivate() {
        this.handlerSprite.visible = false;
    }

    activate() {
        this.handlerSprite.visible = true;
    }

    executeAction() {
        this.initObj.action.call(this.initObj.context, { vLabInteractor: this });
    }
}