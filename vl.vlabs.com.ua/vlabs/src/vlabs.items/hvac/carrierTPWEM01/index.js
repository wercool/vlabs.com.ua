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

       this.screenMapTopOffset = 158;
       this.screenMapIntersectionUV = undefined;

       this.initial = true;

       this.screens = {};
       this.curScreen = undefined;
       this.curScreenActiveElements = [];

       if (this.initObj.detailedView) {
        this.initialized = false;

        this.initObj.detailedView.addVLabItem(this);
        this.parent = this.initObj.detailedView;
       } else {
        this.initialize();
       }
    }

    initialize() {
        var self = this;
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

                this.screenMesh = this.model.getObjectByName('carrierTPWEM01Screen');
                this.screenMaterial = this.screenMesh.material;

                this.screenCanvas = document.createElement('canvas');
                this.screenCanvas.id = 'carrierTPWEM01ScreenCanvas';
                this.screenCanvas.height = 512;
                this.screenCanvas.width = 512;
                this.screenCanvas.style.display = 'none';
                document.body.appendChild(this.screenCanvas);
                this.screenCanvasContext = this.screenCanvas.getContext('2d');

                this.screens['welcomeScreen'] = this.welcomeScreen;
                this.screens['myThermostatSetupScreen'] = this.myThermostatSetupScreen;
                this.screens['powerConnectionsScreen'] = this.powerConnectionsScreen;

                this.addVLabEventListeners();

                var screenAssetsImg = new Image();
                screenAssetsImg.crossOrigin = "Anonymous";
                screenAssetsImg.src = '../vlabs.items/hvac/carrierTPWEM01/assets/screen-assets.jpg';
                screenAssetsImg.onload = function() {
                    self.screenAssetsCanvas = document.createElement('canvas');
                    self.screenAssetsCanvas.id = 'carrierTPWEM01ScreenAssets';
                    self.screenAssetsCanvas.height = 1024;
                    self.screenAssetsCanvas.width = 1024;
                    self.screenAssetsCanvas.style.display = 'none';
                    document.body.appendChild(self.screenAssetsCanvas);
                    self.screenAssetsCanvasContext = self.screenAssetsCanvas.getContext('2d');
                    self.screenAssetsCanvasContext.drawImage(this, 0, 0);
                };

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

        var interactiveObjectsWithInteractiveSuppressors = this.context.interactiveObjects.concat(this.context.interactivesSuppressorsObjects).concat(this.screenMesh);

        this.context.iteractionRaycaster.setFromCamera(this.context.mouseCoordsRaycaster, this.context.defaultCamera);
        var interactionObjectIntersects = this.context.iteractionRaycaster.intersectObjects(interactiveObjectsWithInteractiveSuppressors);

        if (interactionObjectIntersects.length > 0) {

            if (this.initial) {
                this.initial = false;
                this.switchScreen('welcomeScreen');
            }

            this.screenMapIntersectionUV = interactionObjectIntersects[0].uv;
            this.processInteractions();
        }
    }

    onVLabRedererFrameEvent(event) {
    }

    switchScreen(screen) {
        this.curScreen = screen;
        this.screenCanvasContext.clearRect(0, 0, 512, 512);
        this.screenCanvasContext.fillStyle = '#161616';
        this.screenCanvasContext.fillRect(0, 0, 512, 512);

        console.log("animate: " + this.curScreen);
        if (this.curScreen) this.screens[this.curScreen].call(this);

        this.screenMaterial.map = new THREE.Texture(this.screenCanvas);
        this.screenMaterial.map.needsUpdate = true;
        this.screenMapIntersectionUV = undefined;
    }

    intersectionIsInRect(activeElement) {
        if (!this.screenMapIntersectionUV) return;

        var rectX1 = activeElement.rect[0];
        var rectY1 = activeElement.rect[1];
        var rectX2 = activeElement.rect[0] + activeElement.rect[2];
        var rectY2 = activeElement.rect[1] + activeElement.rect[3];
        var x = Math.round(this.screenMapIntersectionUV.x * 512);
        var y = Math.round(512 - this.screenMapIntersectionUV.y * 512);

        // console.log(activeElement.name, rectX1, rectY1, rectX2, rectY2, ' ? ', x, y);

        this.screenMapIntersectionUV = undefined;
        if (x >= rectX1 && y >= rectY1 && x <= rectX2 && y <= rectY2) {
            return true;
        } else {
            return false;
        }
    }

    processInteractions() {
        for (var i = 0; i < this.curScreenActiveElements.length; i++) {
            var activeElement = this.curScreenActiveElements[i];

            this.screenCanvasContext.beginPath();
            this.screenCanvasContext.lineWidth="4";
            this.screenCanvasContext.strokeStyle="yellow";
            this.screenCanvasContext.rect(activeElement.rect[0], activeElement.rect[1], activeElement.rect[2], activeElement.rect[3]);
            this.screenCanvasContext.stroke();

            if (this.intersectionIsInRect(activeElement)) {
                activeElement.onTouch();
            }
        }
    }

    welcomeScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.screenCanvasContext.fillStyle = 'white';
        this.screenCanvasContext.font = 'bold 18px Arial';
        this.screenCanvasContext.fillText('Welcome to the guided setup process.', 10, this.screenMapTopOffset + 80);
        this.screenCanvasContext.fillText('The following screen will walk you through', 10, this.screenMapTopOffset + 140);
        this.screenCanvasContext.fillText('the initial setup process. If you get stuck or', 10, this.screenMapTopOffset + 170);
        this.screenCanvasContext.fillText('have questions contact your Carrier dealer or visit us at ', 10, this.screenMapTopOffset + 200);
        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('www.carrier.com/myhome', 10, this.screenMapTopOffset + 280);

        Promise.all([
            this.nextButton('myThermostatSetupScreen')
        ])
        .then((result) => {
            this.processInteractions();
        })
        .catch(error => {
            console.error(error);
        });
    }

    myThermostatSetupScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('My Thermostat Setup', 150, this.screenMapTopOffset + 50);

        var checkedCheckBoxImgData = this.screenAssetsCanvasContext.getImageData(1, 1, 35, 35);
        var unCheckedCheckBoxImgData = this.screenAssetsCanvasContext.getImageData(1, 35, 35, 35);

        this.screenCanvasContext.font = 'bold 18px Arial';
        this.screenCanvasContext.putImageData(unCheckedCheckBoxImgData, 100, this.screenMapTopOffset + 85);
        this.screenCanvasContext.fillText('Equipment configuration', 150, this.screenMapTopOffset + 107);

        this.screenCanvasContext.putImageData(unCheckedCheckBoxImgData, 100, this.screenMapTopOffset + 130);
        this.screenCanvasContext.fillText('Preferences', 150, this.screenMapTopOffset + 152);

        this.screenCanvasContext.putImageData(unCheckedCheckBoxImgData, 100, this.screenMapTopOffset + 175);
        this.screenCanvasContext.fillText('Preferences', 150, this.screenMapTopOffset + 197);

        this.screenCanvasContext.putImageData(unCheckedCheckBoxImgData, 100, this.screenMapTopOffset + 220);
        this.screenCanvasContext.fillText('Link to web portal', 150, this.screenMapTopOffset + 242);

        Promise.all([
            this.backButton('welcomeScreen'),
            this.infoButton(),
            this.nextButton('powerConnectionsScreen')
        ])
        .then((result) => {
            this.processInteractions();
        })
        .catch(error => {
            console.error(error);
        });
    }

    powerConnectionsScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Power Connections', 165, this.screenMapTopOffset + 40);

        this.screenCanvasContext.font = 'bold 18px Arial';
        this.screenCanvasContext.fillText('A wire has been detected on the', 130, this.screenMapTopOffset + 80);
        this.screenCanvasContext.fillText('Rh terminal. Please confirm which', 130, this.screenMapTopOffset + 100);
        this.screenCanvasContext.fillText('terminals have wires connected.', 130, this.screenMapTopOffset + 120);

        var frameImgDataRh = this.screenAssetsCanvasContext.getImageData(75, 1, 97, 102);
        var frameImgDataRcRh = this.screenAssetsCanvasContext.getImageData(171, 1, 97, 102);
        this.screenCanvasContext.putImageData(frameImgDataRh, 210, this.screenMapTopOffset + 130);

        this.screenCanvasContext.fillText('Rh only', 225, this.screenMapTopOffset + 165);
        this.curScreenActiveElements.push({
            name: 'RhOnlyButton',
            rect: [215, this.screenMapTopOffset + 135, 85, 45],
            onTouch: function() {
                // self.switchScreen('myThermostatSetupScreen');
                console.log(this.name);
            }
        });

        this.screenCanvasContext.fillText('Rc & Rh', 225, this.screenMapTopOffset + 210);
        this.curScreenActiveElements.push({
            name: 'RcRhButton',
            rect: [215, this.screenMapTopOffset + 185, 85, 45],
            onTouch: function() {
                // self.switchScreen('myThermostatSetupScreen');
                console.log(this.name);
            }
        });

        Promise.all([
            this.backButton('myThermostatSetupScreen'),
            this.infoButton(),
            this.nextButton('powerConnectionsScreen')
        ])
        .then((result) => {
            this.processInteractions();
        })
        .catch(error => {
            console.error(error);
        });

    }

    backButton(prevScreenName) {
        return new Promise((resolve, reject) => {
            var self = this;
            this.screenCanvasContext.font = 'bold 30px Arial';
            this.screenCanvasContext.fillText('Back', 10, this.screenMapTopOffset + 340);
            this.curScreenActiveElements.push({
                name: 'backButton',
                rect: [5, this.screenMapTopOffset + 310, 80, 40],
                onTouch: function() {
                    self.switchScreen(prevScreenName);
                }
            });
            resolve(this);
        });
    }

    nextButton(nextScreenName) {
        return new Promise((resolve, reject) => {
            var self = this;
            this.screenCanvasContext.font = 'bold 30px Arial';
            this.screenCanvasContext.fillText('Next', 430, this.screenMapTopOffset + 340);
            this.curScreenActiveElements.push({
                name: 'nextButton',
                rect: [425, this.screenMapTopOffset + 310, 75, 40],
                onTouch: function() {
                    self.switchScreen(nextScreenName);
                }
            });
            resolve(this);
        });
    }

    infoButton() {
        return new Promise((resolve, reject) => {
            var self = this;
            var infoButtonImgData = this.screenAssetsCanvasContext.getImageData(35, 1, 40, 40);
            this.screenCanvasContext.putImageData(infoButtonImgData, 240, this.screenMapTopOffset + 310);
            this.curScreenActiveElements.push({
                name: 'infoButton',
                rect: [240, this.screenMapTopOffset + 310, 40, 40],
                onTouch: function() {
                    console.log(this.name);
                }
            });
            resolve(this);
        });
    }

}