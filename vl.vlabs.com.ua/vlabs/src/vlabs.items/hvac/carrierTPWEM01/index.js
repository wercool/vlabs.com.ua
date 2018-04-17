import * as THREE           from 'three';
import VLab                 from '../../../vlabs.core/vlab';

export default class CarrierTPWEM01 {
    /*
    initObj {
        "context": VLab,
    }
    */
    constructor(initObj) {
       this.initObj = initObj;
       this.context = initObj.context;
       this.pos = initObj.pos;
       this.rot = initObj.rot;

       this.itemName = this.initObj.itemName;

       this.accessableInteractiveELements = [];

       if (this.initObj.detailedView) {
        this.initialized = false;

        this.initObj.detailedView.addVLabItem(this);
        this.parent = this.initObj.detailedView;
       } else {
        this.initialize();
       }
    }

    initialize() {
        return new Promise((resolve, reject) => {
            this.context.loadVLabItem("../vlabs.items/hvac/carrierTPWEM01/carrierTPWEM01.json", "carrierTPWEM01").then((scene) => {
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

                this.screenMaterial = this.model.getObjectByName('carrierTPWEM01Screen').material;

                this.screenCanvas = document.createElement('canvas');
                this.screenCanvas.id = 'carrierTPWEM01ScreenCanvas';
                this.screenCanvas.height = 512;
                this.screenCanvas.width = 512;
                this.screenCanvas.style.display = 'none';
                document.body.appendChild(this.screenCanvas);
                this.screenCanvasContext = this.screenCanvas.getContext('2d');

                this.addVLabEventListeners();

                resolve(this);

                if (this.pos) {
                    this.model.position.copy(this.pos);
                } else {
                    console.error("Carrier TPWEM01 not set");
                }

                if (this.rot) {
                    this.model.rotation.copy(this.rot);
                } else {
                    console.error("Carrier TPWEM01 not set");
                }

            }).catch(error => {
                console.error(error);
                reject('An error happened while loading VLab Item ' + this.itemName, error);
            });
        });
    }


    addVLabEventListeners() {
        //VLab events subscribers
        // this.context.webGLContainerEventsSubcribers.mousedown[this.name + "vLabSceneMouseDown"] = 
        // {
        //     callback: this.onVLabSceneMouseDown,
        //     instance: this
        // };
        // this.context.webGLContainerEventsSubcribers.touchstart[this.name + "vLabSceneTouchStart"] = 
        // {
        //     callback: this.onVLabSceneTouchStart,
        //     instance: this
        // };
        this.context.webGLContainerEventsSubcribers.mouseup[this.name + "vLabSceneMouseUp"] = 
        {
            callback: this.onVLabSceneMouseUp,
            instance: this
        };
        this.context.webGLContainerEventsSubcribers.touchend[this.name + "vLabSceneTouchEnd"] = 
        {
            callback: this.onVLabSceneTouchEnd,
            instance: this
        };
        // this.context.webGLContainerEventsSubcribers.mousemove[this.name + "vLabSceneMouseMove"] = 
        // {
        //     callback: this.onVLabSceneMouseMove,
        //     instance: this
        // };
        this.context.webGLContainerEventsSubcribers.renderframe[this.name + "vLabSceneRenderFrame"] = 
        {
            callback: this.onVLabRedererFrameEvent,
            instance: this
        };
    }

    deleteVLabEventListeners() {
        //VLab events subscribers
        delete this.context.webGLContainerEventsSubcribers.mousedown[this.name + "vLabSceneMouseDown"]; 
        delete this.context.webGLContainerEventsSubcribers.touchstart[this.name + "vLabSceneTouchStart"];
        delete this.context.webGLContainerEventsSubcribers.mouseup[this.name + "vLabSceneMouseUp"];
        delete this.context.webGLContainerEventsSubcribers.touchend[this.name + "vLabSceneTouchEnd"]
        delete this.context.webGLContainerEventsSubcribers.mousemove[this.name + "vLabSceneMouseMove"];
        delete this.context.webGLContainerEventsSubcribers.renderframe[this.name + "vLabSceneRenderFrame"];
        this.context.cursorPointerControlFromVLabItem = false;
    }

    onVLabSceneTouchEnd(evnet) {
        this.onVLabSceneMouseUp(event);
    }

    onVLabSceneMouseUp(event) {
        this.animate();
    }

    onVLabRedererFrameEvent(event) {
        // this.animate();
    }

    animate(time) {
        //test
        this.screenCanvasContext.fillStyle = "#00ff00";
        this.screenCanvasContext.fillRect(0, 0, 512, 512);
        this.screenCanvasContext.beginPath();
        this.screenCanvasContext.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
        this.screenCanvasContext.moveTo(110, 75);
        this.screenCanvasContext.arc(75, 75, 35, 0, Math.PI, false);  // Mouth (clockwise)
        this.screenCanvasContext.moveTo(65, 65);
        this.screenCanvasContext.arc(60, 65, 5, 0, Math.PI * 2, true);  // Left eye
        this.screenCanvasContext.moveTo(95, 65);
        this.screenCanvasContext.arc(90, 65, 5, 0, Math.PI * 2, true);  // Right eye
        this.screenCanvasContext.stroke();

        this.screenMaterial.map = new THREE.Texture(this.screenCanvas);
        this.screenMaterial.map.needsUpdate = true;
    }

}