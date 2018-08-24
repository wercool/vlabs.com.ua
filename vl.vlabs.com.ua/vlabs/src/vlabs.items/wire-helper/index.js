import * as THREE               from 'three';

export default class WireHelper {
    constructor(initObj) {
        this.initObj = initObj;

        this.context = this.initObj.context;

        var textureLoader = new THREE.TextureLoader();

        if (this.initObj.icon == undefined) {
            console.error(this.initObj.name + ' WireHelper wire end icon is not defined');
            return undefined;
        }

        Promise.all([
            textureLoader.load(this.initObj.icon),
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
            rotation: this.initObj.iconRotation ? this.initObj.iconRotation : 0.0,
            depthTest: this.initObj.depthTest !== undefined ? this.initObj.depthTest : true,
            depthWrite: this.initObj.depthWrite !== undefined ? this.initObj.depthWrite : true,
        });

        this.handlerSprite = new THREE.Sprite(this.handlerSpriteMaterial);
        this.handlerSprite.name = this.initObj.name + "WireHelper";
        this.handlerSprite.scale.copy(this.initObj.scale ? this.initObj.scale : new THREE.Vector3(1.0, 1.0, 1.0));

        if (this.initObj.visible !== undefined) {
            this.handlerSprite.visible = this.initObj.visible;
        }

        if (this.initObj.object) {
            this.initObj.object.add(this.handlerSprite);
            if (this.initObj.objectRelPos) {
                this.handlerSprite.position.add(this.initObj.objectRelPos);
            }
        } else {
            console.error(this.initObj.name + ' WireHelper target wire is not defined');
            return;
        }

        var lineMaterial = new THREE.LineDashedMaterial( {
            color: 0xffffff,
            dashSize: 0.005,
            gapSize:  0.0025,
            depthTest: false,
            depthWrite: false,
            alphaTest: 0.1
        });

        var lineGeometry = new THREE.Geometry();
        lineGeometry.vertices.push(
            new THREE.Vector3(0.0, 0.0, 0.0),
            this.handlerSprite.position
        );

        this.directPathLine = new THREE.Line(lineGeometry, lineMaterial);

        // this.directPathLine = new THREE.ArrowHelper(this.handlerSprite.position.clone().normalize(), new THREE.Vector3(), new THREE.Vector3().distanceTo(this.handlerSprite.position), new THREE.Color(0xffffff));

        this.initObj.object.add(this.directPathLine);



        //VLab events subscribers
        // this.context.webGLContainerEventsSubcribers.mouseup[this.handlerSprite.name + "vLabSceneMouseUp"] = 
        // {
        //     callback: this.onVLabSceneMouseUp,
        //     instance: this
        // };
        // this.context.webGLContainerEventsSubcribers.touchend[this.handlerSprite.name + "vLabSceneTouchEnd"] = 
        // {
        //     callback: this.onVLabSceneTouchEnd,
        //     instance: this
        // };

        console.log("WireHelper initialized");
    }

    // onVLabSceneMouseUp(event) {
    //     // console.log("VLabLocator onVLabSceneMouseUp", event.type);
    //     this.interactionEvent();
    // }

    // onVLabSceneTouchEnd(event) {
    //     // console.log("VLabLocator onVLabSceneTouchEnd", event.type);
    //     this.interactionEvent();
    // }

    // interactionEvent() {
    //     if (!this.handlerSprite.visible || this.context.paused) {
    //         return;
    //     }

    //     this.context.helpersRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);

    //     var intersectObjects = this.context.interactivesSuppressorsObjects.slice();
    //     intersectObjects = intersectObjects.concat(this.handlerSprite);

    //     var intersects = this.context.helpersRaycaster.intersectObjects(intersectObjects);

    //     if (intersects.length > 0) {
    //         if (intersects[0].object == this.handlerSprite) {
    //             this.executeAction();
    //         }
    //     }
    // }
}