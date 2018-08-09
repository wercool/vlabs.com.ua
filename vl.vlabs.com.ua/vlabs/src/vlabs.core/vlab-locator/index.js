import * as THREE               from 'three';
import * as TWEEN               from 'tween.js';

export default class VLabLocator {
    constructor(initObj) {
        this.initObj = initObj;

        this.context = this.initObj.context;

        this.locations = {};

        this.currentLocationVLab = undefined;

        var textureLoader = new THREE.TextureLoader();

        Promise.all([
            textureLoader.load('../vlabs.assets/img/direction.png'),
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
            color: 0x0000ff,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.5,
            rotation: 0.0,
            depthTest: true,
            depthWrite: true
        });
        console.log("VLabLocator initialized");
    }

    addLocation(vLab) {
        this.locations[vLab.name] = vLab;

        this.currentLocationVLab = vLab;

        if (this.context.locations[vLab.name]) {
            var transientLocationsMap = this.initObj.transientLocationsMap[vLab.name];
            vLab["VLabLocatorHandlers"] = [];
            for (var transientLocationName in transientLocationsMap) {
                var transientLocation = transientLocationsMap[transientLocationName];
                var handlerSprite = new THREE.Sprite(this.handlerSpriteMaterial);
                handlerSprite.name = transientLocationName + "VLabLocatorSprite";
                handlerSprite.scale.copy(transientLocation.scale ? transientLocation.scale : new THREE.Vector3(1.0, 1.0, 1.0));
                handlerSprite.position.copy(transientLocation.pos);

                handlerSprite.userData["transientLocationName"] = transientLocationName;

                // var handlerSpriteAnimatedPosY = handlerSprite.position.clone().y + 0.02;
                // new TWEEN.Tween(handlerSprite.position)
                // .to({y: handlerSpriteAnimatedPosY}, 1000)
                // .repeat(Infinity)
                // .yoyo(true)
                // .easing(TWEEN.Easing.Quadratic.InOut).start();

                vLab.vLabScene.add(handlerSprite);

                vLab["VLabLocatorHandlers"].push(handlerSprite);

                //VLab events subscribers
                vLab.webGLContainerEventsSubcribers.mouseup[handlerSprite.name + "vLabSceneMouseUp"] = 
                {
                    callback: this.onVLabSceneMouseUp,
                    instance: this
                };
                vLab.webGLContainerEventsSubcribers.touchend[handlerSprite.name + "vLabSceneTouchEnd"] = 
                {
                    callback: this.onVLabSceneTouchEnd,
                    instance: this
                };

                handlerSprite.visible = transientLocation.visible;
            }
        }

        console.log(vLab.name + " VLab location added");
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
        if (this.currentLocationVLab.defaultCameraControls.type !== 'orbit' || this.currentLocationVLab.paused) {
            return;
        }
        this.currentLocationVLab.helpersRaycaster.setFromCamera(this.currentLocationVLab.mouseCoordsRaycaster, this.currentLocationVLab.defaultCamera);

        var intersectObjects = this.currentLocationVLab.interactivesSuppressorsObjects.slice();
        intersectObjects = intersectObjects.concat(this.currentLocationVLab.VLabLocatorHandlers);

        var intersects = this.currentLocationVLab.helpersRaycaster.intersectObjects(intersectObjects);

        if (intersects.length > 0) {
            if (this.currentLocationVLab.VLabLocatorHandlers.indexOf(intersects[0].object) > -1) {
                this.activateVLabLocation(intersects[0].object.userData["transientLocationName"]);
            }
        }
    }

    activateVLabLocation(transientLocationName, paramsObj){
        if (paramsObj) {
            if (paramsObj.auto) {
                this.currentLocationVLab.statsTHREE.domElement.style.visibility = 'visible';
            }
        }
        if (this.initObj.beforeLocationChanged) {
            this.initObj.beforeLocationChanged.call(this.context, transientLocationName);
        }
        this.currentLocationVLab.stopAndHide();
        if (this.context.locations[transientLocationName] === undefined) {
            this.waitForLocationName = transientLocationName;
            this.waitForLocationInitialized();
            this.context.locations[transientLocationName] = new this.context.locationInitObjs[transientLocationName].class(this.context.locationInitObjs[transientLocationName]);
        } else {
            this.currentLocationVLab = this.context.locations[transientLocationName];
            this.currentLocationVLab.resumeAndShow(paramsObj);
            if (this.initObj.locationChanged) {
                this.initObj.locationChanged.call(this.context, transientLocationName);
            }
        }
    }

    waitForLocationInitialized() {
        if (this.context.locations[this.waitForLocationName] === undefined) {
            setTimeout(this.waitForLocationInitialized.bind(this), 250);
            return;
        } else {
            if (this.context.locations[this.waitForLocationName].initialized !== true) {
                setTimeout(this.waitForLocationInitialized.bind(this), 250);
                return;
            }
        }
        if (this.initObj.locationChanged) {
            this.initObj.locationChanged.call(this.context, this.waitForLocationName);
        }
        this.waitForLocationName = undefined;
    }
}