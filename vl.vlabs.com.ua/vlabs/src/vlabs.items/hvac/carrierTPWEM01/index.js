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

       this.screenMapTopOffset = 158;
       this.screenMapIntersectionUV = undefined;

       this.curState = {};

       this.screens = {};
       this.curScreen = undefined;
       this.curScreenActiveElements = [];

       this.initial = true;

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

                /* Screen */
                this.screens['menuScreen'] = this.menuScreen;
                this.screens['welcomeScreen'] = this.welcomeScreen;
                this.screens['myThermostatSetupScreen'] = this.myThermostatSetupScreen;
                this.screens['powerConnectionsScreen'] = this.powerConnectionsScreen;
                this.screens['terminalsConnectedScreen'] = this.terminalsConnectedScreen;
                this.screens['terminalsConnectedManualOverrideConfirmationScreen'] = this.terminalsConnectedManualOverrideConfirmationScreen;
                this.screens['terminalsConnectedManualScreen'] = this.terminalsConnectedManualScreen;
                this.screens['terminalsConnectedManualEraseConfirmationScreen'] = this.terminalsConnectedManualEraseConfirmationScreen;
                this.screens['accessoryScreen'] = this.accessoryScreen;
                this.screens['accessoryPowerSourceScreen'] = this.accessoryPowerSourceScreen;
                this.screens['accessoryTypeScreen'] = this.accessoryTypeScreen;
                this.screens['equipmentConfiguredScreen'] = this.equipmentConfiguredScreen;
                this.screens['myThermostatNameScreen'] = this.myThermostatNameScreen;
                this.screens['fahrenheitCelsiusScreen'] = this.fahrenheitCelsiusScreen;
                this.screens['setIdealHomeTemperatureScreen'] = this.setIdealHomeTemperatureScreen;
                this.screens['baseScreen'] = this.baseScreen;
                this.screens['settingsScreen'] = this.settingsScreen;
                this.screens['preferencesScreen'] = this.preferencesScreen;

                /* State */
                this.curState['roomTemperature'] = 23;
                this.curState['roomHumidity'] = 40;
                this.curState['EquipmentConfiguration'] = false;
                this.curState['Preferences'] = false;
                this.curState['Rh_RcRh'] = 'Rh';
                this.curState['terminalsConnected'] = {
                    Rc: false,
                    W1: true,
                    Y1: true,
                    Rh: true,
                    W2: false,
                    Y2: false,
                    C: true,
                    G: true,
                    OB: false
                };
                this.curState['terminalsConnectedManual'] = {
                    W1: this.curState['terminalsConnected'].W1,
                    Y1: this.curState['terminalsConnected'].Y1,
                    W2: this.curState['terminalsConnected'].W2,
                    Y2: this.curState['terminalsConnected'].Y2,
                    G: this.curState['terminalsConnected'].G,
                    OB: this.curState['terminalsConnected'].OB
                };
                this.curState['terminalsConnectedScreenManualOverride'] = false;
                this.curState['accessoryWiresToAcc'] = false;
                this.curState['accessoryPowerSameAsThermostat'] = true;
                this.curState['accessoryType'] = 'humidifier';
                this.curState['fahrenheitOrCelsius'] = 'F';
                this.curState['idealHomeTemperatureWinter'] = 20;
                this.curState['idealHomeTemperatureSummer'] = 24;
                this.curState['baseScreenTimer'] = undefined;
                this.curState['baseScreenSetupMode'] = 'heat';
                this.curState['heatToTemperature'] = 20;
                this.curState['coolToTemperature'] = 24;
                this.curState['fanMode'] = 'Auto';
                this.curState['mainMode'] = 'Auto';

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

                    if (self.initObj.initialScreen) {
                        self.initial = false;
                        self.switchScreen(self.initObj.initialScreen);
                    }
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

            if (interactionObjectIntersects[0].object == this.screenMesh) {
                if (this.initial) {
                    this.initial = false;
                    this.switchScreen('welcomeScreen');
                }

                this.screenMapIntersectionUV = interactionObjectIntersects[0].uv;
                this.processInteractions();
            }
        }
    }

    onVLabRedererFrameEvent(event) {
    }

    switchScreen(screen, args) {
        this.curScreen = screen;
        this.screenCanvasContext.clearRect(0, 0, 512, 512);
        this.screenCanvasContext.fillStyle = '#161616';
        this.screenCanvasContext.fillRect(0, 0, 512, 512);

        if (this.curState['baseScreenTimer'] != undefined) {
            clearTimeout(this.curState['baseScreenTimer']);
        }

        if (this.curScreen) this.screens[this.curScreen].call(this, args);

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

        if (x >= rectX1 && y >= rectY1 && x <= rectX2 && y <= rectY2) {
            this.screenMapIntersectionUV = undefined;
            return true;
        } else {
            return false;
        }
    }

    processInteractions() {
        for (var i = 0; i < this.curScreenActiveElements.length; i++) {
            var activeElement = this.curScreenActiveElements[i];

            // this.screenCanvasContext.beginPath();
            // this.screenCanvasContext.lineWidth="4";
            // this.screenCanvasContext.strokeStyle="yellow";
            // this.screenCanvasContext.rect(activeElement.rect[0], activeElement.rect[1], activeElement.rect[2], activeElement.rect[3]);
            // this.screenCanvasContext.stroke();

            if (this.intersectionIsInRect(activeElement)) {
                activeElement.onTouch();
            }
        }
    }

    putTemperatureLabel(x, y, t, font, label) {
        this.screenCanvasContext.fillStyle = 'white';
        if (this.curState['fahrenheitOrCelsius'] == 'F') {
            t = t * 9/5 + 32;
        }
        this.screenCanvasContext.font = font ? font : '30px Arial';
        this.screenCanvasContext.fillText(Math.round(t).toString() + '°' + (label ? this.curState['fahrenheitOrCelsius'] : ''), x, y);
    }

    getTemperature(prefObj) {
        var temperature = this.curState[prefObj.tempId]
        if (prefObj.format == 'F') {
            temperature = temperature * 9/5 + 32;
        }
        return temperature;
    }

    backButton(prevScreenName, buttonText) {
        var self = this;
        this.screenCanvasContext.fillStyle = 'white';
        this.screenCanvasContext.font = 'bold 30px Arial';
        this.screenCanvasContext.fillText(buttonText ? buttonText : 'Back', 10, this.screenMapTopOffset + 340);
        this.curScreenActiveElements.push({
            name: 'backButton',
            rect: [5, this.screenMapTopOffset + 310, 80, 40],
            onTouch: function() {
                self.switchScreen(prevScreenName);
            }
        });
    }

    nextButton(nextScreenName, buttonText, w, h) {
        var self = this;
        this.screenCanvasContext.fillStyle = 'white';
        this.screenCanvasContext.font = 'bold 30px Arial';
        this.screenCanvasContext.fillText(buttonText ? buttonText : 'Next', 430, this.screenMapTopOffset + 340);
        this.curScreenActiveElements.push({
            name: 'nextButton',
            rect: [425, this.screenMapTopOffset + 310, w ? w : 75, 40],
            onTouch: function() {
                self.switchScreen(nextScreenName);
            }
        });
    }

    infoButton() {
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

        this.nextButton('myThermostatSetupScreen');

        this.processInteractions();
    }

    myThermostatSetupScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('My Thermostat Setup', 150, this.screenMapTopOffset + 50);

        var checkedCheckBoxImgData = this.screenAssetsCanvasContext.getImageData(1, 1, 35, 34);
        var unCheckedCheckBoxImgData = this.screenAssetsCanvasContext.getImageData(1, 35, 35, 35);

        this.screenCanvasContext.font = 'bold 18px Arial';
        this.screenCanvasContext.putImageData(this.curState["EquipmentConfiguration"] ? checkedCheckBoxImgData : unCheckedCheckBoxImgData, 100, this.screenMapTopOffset + 85);
        this.screenCanvasContext.fillText('Equipment configuration', 150, this.screenMapTopOffset + 107);

        this.screenCanvasContext.putImageData(this.curState['Preferences'] ? checkedCheckBoxImgData : unCheckedCheckBoxImgData, 100, this.screenMapTopOffset + 130);
        this.screenCanvasContext.fillText('Preferences', 150, this.screenMapTopOffset + 152);

        this.screenCanvasContext.putImageData(checkedCheckBoxImgData, 100, this.screenMapTopOffset + 175);
        this.screenCanvasContext.fillText('Network connection', 150, this.screenMapTopOffset + 197);

        this.screenCanvasContext.putImageData(checkedCheckBoxImgData, 100, this.screenMapTopOffset + 220);
        this.screenCanvasContext.fillText('Link to web portal', 150, this.screenMapTopOffset + 242);

        this.backButton('welcomeScreen');
        this.infoButton();
        if (!this.curState["EquipmentConfiguration"]) {
            this.nextButton('powerConnectionsScreen');
        } else if (!this.curState['Preferences']) {
            this.nextButton('myThermostatNameScreen');
        } else if (this.curState['Preferences']) {
            this.nextButton('baseScreen');
        }

        this.processInteractions();
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

        this.screenCanvasContext.putImageData(this.curState["Rh_RcRh"] == 'Rh' ? frameImgDataRh : frameImgDataRcRh, 210, this.screenMapTopOffset + 130);

        this.screenCanvasContext.fillText('Rh only', 225, this.screenMapTopOffset + 165);
        this.screenCanvasContext.fillText('Rc & Rh', 225, this.screenMapTopOffset + 210);

        this.curScreenActiveElements.push({
            name: 'RhOnlyButton',
            rect: [215, this.screenMapTopOffset + 135, 90, 45],
            onTouch: function() {
                self.curState["Rh_RcRh"] = 'Rh';
                self.switchScreen('powerConnectionsScreen');
            }
        });

        this.curScreenActiveElements.push({
            name: 'RcRhButton',
            rect: [215, this.screenMapTopOffset + 185, 90, 45],
            onTouch: function() {
                self.curState["Rh_RcRh"] = 'RcRh';
                self.switchScreen('powerConnectionsScreen');
            }
        });

        if (!this.curState['terminalsConnectedScreenManualOverride']) {
            this.backButton('myThermostatSetupScreen');
            this.nextButton('terminalsConnectedScreen');
        } else {
            this.backButton('terminalsConnectedScreen');
            this.nextButton('terminalsConnectedManualScreen');
        }

        this.infoButton();

        this.processInteractions();
    }

    terminalsConnectedScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Terminals Connected', 165, this.screenMapTopOffset + 40);


        var grayButton = this.screenAssetsCanvasContext.getImageData(270, 1, 87, 43);
        var greenButton = this.screenAssetsCanvasContext.getImageData(270, 43, 87, 43);
        var overrideOptionBlock = this.screenAssetsCanvasContext.getImageData(357, 1, 134, 166);

        this.screenCanvasContext.putImageData(this.curState['terminalsConnected'].Rc ? greenButton : grayButton, 150, this.screenMapTopOffset + 60);
        this.screenCanvasContext.putImageData(this.curState['terminalsConnected'].W1 ? greenButton : grayButton, 250, this.screenMapTopOffset + 60);
        this.screenCanvasContext.putImageData(this.curState['terminalsConnected'].Y1 ? greenButton : grayButton, 350, this.screenMapTopOffset + 60);
        this.screenCanvasContext.putImageData(this.curState['terminalsConnected'].Rh ? greenButton : grayButton, 150, this.screenMapTopOffset + 120);
        this.screenCanvasContext.putImageData(this.curState['terminalsConnected'].W2 ? greenButton : grayButton, 250, this.screenMapTopOffset + 120);
        this.screenCanvasContext.putImageData(this.curState['terminalsConnected'].Y2 ? greenButton : grayButton, 350, this.screenMapTopOffset + 120);
        this.screenCanvasContext.putImageData(this.curState['terminalsConnected'].C ? greenButton : grayButton, 150, this.screenMapTopOffset + 180);
        this.screenCanvasContext.putImageData(this.curState['terminalsConnected'].G ? greenButton : grayButton, 250, this.screenMapTopOffset + 180);
        this.screenCanvasContext.putImageData(this.curState['terminalsConnected'].OB ? greenButton : grayButton, 350, this.screenMapTopOffset + 180);

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Rc', 180, this.screenMapTopOffset + 88);
        this.screenCanvasContext.fillText('W1', 280, this.screenMapTopOffset + 88);
        this.screenCanvasContext.fillText('Y1', 380, this.screenMapTopOffset + 88);
        this.screenCanvasContext.fillText('Rh', 180, this.screenMapTopOffset + 148);
        this.screenCanvasContext.fillText('W2', 280, this.screenMapTopOffset + 148);
        this.screenCanvasContext.fillText('Y2', 380, this.screenMapTopOffset + 148);
        this.screenCanvasContext.fillText('C', 185, this.screenMapTopOffset + 209);
        this.screenCanvasContext.fillText('G', 285, this.screenMapTopOffset + 209);
        this.screenCanvasContext.fillText('O/B', 375, this.screenMapTopOffset + 209);

        this.screenCanvasContext.putImageData(overrideOptionBlock, 5, this.screenMapTopOffset + 60);

        this.curScreenActiveElements.push({
            name: 'overrideButton',
            rect: [24, this.screenMapTopOffset + 170, 95, 45],
            onTouch: function() {
                self.switchScreen('terminalsConnectedManualOverrideConfirmationScreen');
            }
        });

        this.screenCanvasContext.fillStyle = '#abcd89';
        this.screenCanvasContext.font = '18px Arial';
        this.screenCanvasContext.fillText('NOTE: For this configuration the indoor unit will control the fan', 5, this.screenMapTopOffset + 250);
        this.screenCanvasContext.fillText('when heating. Thermostat fan control can be enabled in the', 5, this.screenMapTopOffset + 270);
        this.screenCanvasContext.fillText('installation settings menu after initial setup is complete.', 5, this.screenMapTopOffset + 290);

        this.backButton('powerConnectionsScreen');
        this.infoButton();
        this.nextButton('accessoryScreen');


        this.processInteractions();
    }

    terminalsConnectedManualScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Terminals Connected', 165, this.screenMapTopOffset + 40);

        var grayButton = this.screenAssetsCanvasContext.getImageData(270, 1, 87, 43);
        var greenButton = this.screenAssetsCanvasContext.getImageData(270, 43, 87, 43);
        var overrideOptionBlock = this.screenAssetsCanvasContext.getImageData(492, 1, 134, 166);

        this.screenCanvasContext.putImageData(this.curState['terminalsConnectedManual'].W1 ? greenButton : grayButton, 250, this.screenMapTopOffset + 60);
        this.screenCanvasContext.putImageData(this.curState['terminalsConnectedManual'].Y1 ? greenButton : grayButton, 350, this.screenMapTopOffset + 60);
        this.screenCanvasContext.putImageData(this.curState['terminalsConnectedManual'].W2 ? greenButton : grayButton, 250, this.screenMapTopOffset + 120);
        this.screenCanvasContext.putImageData(this.curState['terminalsConnectedManual'].Y2 ? greenButton : grayButton, 350, this.screenMapTopOffset + 120);
        this.screenCanvasContext.putImageData(this.curState['terminalsConnectedManual'].G ? greenButton : grayButton, 250, this.screenMapTopOffset + 180);
        this.screenCanvasContext.putImageData(this.curState['terminalsConnectedManual'].OB ? greenButton : grayButton, 350, this.screenMapTopOffset + 180);

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('W1', 280, this.screenMapTopOffset + 88);
        this.screenCanvasContext.fillText('Y1', 380, this.screenMapTopOffset + 88);
        this.screenCanvasContext.fillText('W2', 280, this.screenMapTopOffset + 148);
        this.screenCanvasContext.fillText('Y2', 380, this.screenMapTopOffset + 148);
        this.screenCanvasContext.fillText('G', 285, this.screenMapTopOffset + 209);
        this.screenCanvasContext.fillText('O/B', 375, this.screenMapTopOffset + 209);

        this.curScreenActiveElements.push({
            name: 'W1Button',
            rect: [245, this.screenMapTopOffset + 60, 92, 45],
            onTouch: function() {
                self.curState['terminalsConnectedManual'].W1 = !self.curState['terminalsConnectedManual'].W1;
                self.switchScreen('terminalsConnectedManualScreen');
            }
        });
        this.curScreenActiveElements.push({
            name: 'Y1Button',
            rect: [345, this.screenMapTopOffset + 60, 92, 45],
            onTouch: function() {
                self.curState['terminalsConnectedManual'].Y1 = !self.curState['terminalsConnectedManual'].Y1;
                self.switchScreen('terminalsConnectedManualScreen');
            }
        });
        this.curScreenActiveElements.push({
            name: 'W2Button',
            rect: [245, this.screenMapTopOffset + 120, 92, 45],
            onTouch: function() {
                self.curState['terminalsConnectedManual'].W2 = !self.curState['terminalsConnectedManual'].W2;
                self.switchScreen('terminalsConnectedManualScreen');
            }
        });
        this.curScreenActiveElements.push({
            name: 'Y2Button',
            rect: [345, this.screenMapTopOffset + 120, 92, 45],
            onTouch: function() {
                self.curState['terminalsConnectedManual'].Y2 = !self.curState['terminalsConnectedManual'].Y2;
                self.switchScreen('terminalsConnectedManualScreen');
            }
        });
        this.curScreenActiveElements.push({
            name: 'GButton',
            rect: [245, this.screenMapTopOffset + 180, 92, 45],
            onTouch: function() {
                self.curState['terminalsConnectedManual'].G = !self.curState['terminalsConnectedManual'].G;
                self.switchScreen('terminalsConnectedManualScreen');
            }
        });
        this.curScreenActiveElements.push({
            name: 'OBButton',
            rect: [345, this.screenMapTopOffset + 180, 92, 45],
            onTouch: function() {
                self.curState['terminalsConnectedManual'].OB = !self.curState['terminalsConnectedManual'].OB;
                self.switchScreen('terminalsConnectedManualScreen');
            }
        });

        this.screenCanvasContext.putImageData(overrideOptionBlock, 5, this.screenMapTopOffset + 60);
        this.curScreenActiveElements.push({
            name: 'overrideOffButton',
            rect: [24, this.screenMapTopOffset + 170, 95, 45],
            onTouch: function() {
                self.switchScreen('terminalsConnectedManualEraseConfirmationScreen');
            }
        });

        this.backButton('terminalsConnectedManualEraseConfirmationScreen');
        this.infoButton();
        this.nextButton('accessoryScreen');

        this.processInteractions();
    }

    terminalsConnectedManualEraseConfirmationScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Loss of Manual Override', 100, this.screenMapTopOffset + 40);

        this.screenCanvasContext.fillText('Enabling equipment auto-detection will erase', 20, this.screenMapTopOffset + 150);
        this.screenCanvasContext.fillText('your manual configuration. Are you sure you', 20, this.screenMapTopOffset + 175);
        this.screenCanvasContext.fillText('want to continue?', 20, this.screenMapTopOffset + 200);

        this.backButton('terminalsConnectedManualScreen', 'No');

        this.screenCanvasContext.fillStyle = 'white';
        this.screenCanvasContext.font = 'bold 30px Arial';
        this.screenCanvasContext.fillText('Yes', 430, this.screenMapTopOffset + 340);
        this.curScreenActiveElements.push({
            name: 'nextButton',
            rect: [425, this.screenMapTopOffset + 310, 75, 40],
            onTouch: function() {
                self.curState['terminalsConnectedScreenManualOverride'] = false;
                self.switchScreen('terminalsConnectedScreen');
            }
        });
    }

    terminalsConnectedManualOverrideConfirmationScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.curState['terminalsConnectedScreenManualOverride'] = false;

        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Manual Override', 165, this.screenMapTopOffset + 40);

        this.screenCanvasContext.fillText('WARNING: Incorrect configuration of the', 20, this.screenMapTopOffset + 150);
        this.screenCanvasContext.fillText('system may lead to improper operations and', 20, this.screenMapTopOffset + 175);
        this.screenCanvasContext.fillText('system damage. Only professional installers', 20, this.screenMapTopOffset + 200);
        this.screenCanvasContext.fillText('should proceed with auto detection disabled.', 20, this.screenMapTopOffset + 225);
        this.screenCanvasContext.fillText('Are you sure you want to continue?', 20, this.screenMapTopOffset + 250);

        this.backButton('terminalsConnectedScreen', 'No');

        this.screenCanvasContext.fillStyle = 'white';
        this.screenCanvasContext.font = 'bold 30px Arial';
        this.screenCanvasContext.fillText('Yes', 430, this.screenMapTopOffset + 340);
        this.curScreenActiveElements.push({
            name: 'nextButton',
            rect: [425, this.screenMapTopOffset + 310, 75, 40],
            onTouch: function() {
                self.curState['terminalsConnectedScreenManualOverride'] = true;
                self.switchScreen('powerConnectionsScreen');
            }
        });


        this.processInteractions();
    }

    accessoryScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Accessory', 200, this.screenMapTopOffset + 40);

        var yesBlock = this.screenAssetsCanvasContext.getImageData(725, 1, 97, 103);
        var noBlock = this.screenAssetsCanvasContext.getImageData(626, 1, 97, 103);

        this.screenCanvasContext.font = 'bold 18px Arial';
        this.screenCanvasContext.fillText('Are there accessory wires', 140, this.screenMapTopOffset + 90);
        this.screenCanvasContext.fillText('connected to Acc+ and Acc- ?', 135, this.screenMapTopOffset + 110);

        this.screenCanvasContext.putImageData(this.curState['accessoryWiresToAcc'] ? yesBlock : noBlock, 210, this.screenMapTopOffset + 140);

        this.curScreenActiveElements.push({
            name: 'yesButton',
            rect: [215, this.screenMapTopOffset + 145, 90, 45],
            onTouch: function() {
                self.curState['accessoryWiresToAcc'] = true;
                self.switchScreen('accessoryScreen');
            }
        });

        this.curScreenActiveElements.push({
            name: 'noButton',
            rect: [215, this.screenMapTopOffset + 193, 90, 45],
            onTouch: function() {
                self.curState['accessoryWiresToAcc'] = false;
                self.switchScreen('accessoryScreen');
            }
        });

        if (this.curState['terminalsConnectedScreenManualOverride'] === true) {
            this.backButton('terminalsConnectedManualScreen');
        } else {
            this.backButton('terminalsConnectedScreen');
        }
        this.infoButton();

        if (this.curState['accessoryWiresToAcc']) {
            this.nextButton('accessoryPowerSourceScreen');
        } else {
            this.nextButton('equipmentConfiguredScreen');
        }


        this.processInteractions();
    }

    accessoryPowerSourceScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Accessory Power Source', 130, this.screenMapTopOffset + 40);

        var yesBlock = this.screenAssetsCanvasContext.getImageData(725, 1, 97, 103);
        var noBlock = this.screenAssetsCanvasContext.getImageData(626, 1, 97, 103);

        this.screenCanvasContext.font = 'bold 18px Arial';
        this.screenCanvasContext.fillText('Is the accessory control power', 135, this.screenMapTopOffset + 90);
        this.screenCanvasContext.fillText('the same as the thermostat', 140, this.screenMapTopOffset + 110);

        this.screenCanvasContext.putImageData(this.curState['accessoryPowerSameAsThermostat'] ? yesBlock : noBlock, 210, this.screenMapTopOffset + 140);

        this.screenCanvasContext.font = 'bold 16px Arial';
        if (this.curState['accessoryPowerSameAsThermostat']) {
            this.screenCanvasContext.fillText('The thermostat', 325, this.screenMapTopOffset + 160);
            this.screenCanvasContext.fillText('provides the', 325, this.screenMapTopOffset + 180);
            this.screenCanvasContext.fillText('control power using', 325, this.screenMapTopOffset + 200);
            this.screenCanvasContext.fillText('Rh/Rc', 325, this.screenMapTopOffset + 220);
        } else {
            this.screenCanvasContext.fillText('The control power is', 325, this.screenMapTopOffset + 160);
            this.screenCanvasContext.fillText('isolated from the', 325, this.screenMapTopOffset + 180);
            this.screenCanvasContext.fillText('thermostat', 325, this.screenMapTopOffset + 200);
        }

        this.curScreenActiveElements.push({
            name: 'yesButton',
            rect: [215, this.screenMapTopOffset + 145, 90, 45],
            onTouch: function() {
                self.curState['accessoryPowerSameAsThermostat'] = true;
                self.switchScreen('accessoryPowerSourceScreen');
            }
        });

        this.curScreenActiveElements.push({
            name: 'noButton',
            rect: [215, this.screenMapTopOffset + 193, 90, 45],
            onTouch: function() {
                self.curState['accessoryPowerSameAsThermostat'] = false;
                self.switchScreen('accessoryPowerSourceScreen');
            }
        });

        this.backButton('accessoryScreen');
        this.infoButton();
        this.nextButton('accessoryTypeScreen');


        this.processInteractions();
    }

    accessoryTypeScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Accessory Type', 180, this.screenMapTopOffset + 40);

        var grayButton = this.screenAssetsCanvasContext.getImageData(270, 1, 87, 43);
        var greenButton = this.screenAssetsCanvasContext.getImageData(270, 43, 87, 43);

        this.screenCanvasContext.putImageData(this.curState['accessoryType'] == 'humidifier' ? greenButton : grayButton, 210, this.screenMapTopOffset + 100);
        this.screenCanvasContext.putImageData(this.curState['accessoryType'] == 'dehumidifier' ? greenButton : grayButton, 210, this.screenMapTopOffset + 150);
        this.screenCanvasContext.putImageData(this.curState['accessoryType'] == 'ventilator' ? greenButton : grayButton, 210, this.screenMapTopOffset + 200);

        this.screenCanvasContext.font = '14px Arial';
        this.screenCanvasContext.fillText('Humidifier', 220, this.screenMapTopOffset + 125);
        this.curScreenActiveElements.push({
            name: 'humidifierButton',
            rect: [210, this.screenMapTopOffset + 100, 83, 40],
            onTouch: function() {
                self.curState['accessoryType'] = 'humidifier';
                self.switchScreen('accessoryTypeScreen');
            }
        });

        this.screenCanvasContext.fillText('Dehumidifier', 215, this.screenMapTopOffset + 175);
        this.curScreenActiveElements.push({
            name: 'humidifierButton',
            rect: [210, this.screenMapTopOffset + 150, 83, 40],
            onTouch: function() {
                self.curState['accessoryType'] = 'dehumidifier';
                self.switchScreen('accessoryTypeScreen');
            }
        });

        this.screenCanvasContext.fillText('Ventilator', 220, this.screenMapTopOffset + 225);
        this.curScreenActiveElements.push({
            name: 'humidifierButton',
            rect: [210, this.screenMapTopOffset + 200, 83, 40],
            onTouch: function() {
                self.curState['accessoryType'] = 'ventilator';
                self.switchScreen('accessoryTypeScreen');
            }
        });

        // this.curScreenActiveElements.push({
        //     name: 'noButton',
        //     rect: [215, this.screenMapTopOffset + 193, 90, 45],
        //     onTouch: function() {
        //         self.curState['accessoryPowerSameAsThermostat'] = false;
        //         self.switchScreen('accessoryPowerSourceScreen');
        //     }
        // });

        this.backButton('accessoryPowerSourceScreen');
        this.infoButton();
        this.nextButton('equipmentConfiguredScreen');


        this.processInteractions();
    }

    equipmentConfiguredScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.curState["EquipmentConfiguration"] = true;

        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Equipment Configured', 135, this.screenMapTopOffset + 40);

        var grayButton = this.screenAssetsCanvasContext.getImageData(270, 1, 87, 43);
        var greenButton = this.screenAssetsCanvasContext.getImageData(270, 43, 87, 43);

        this.screenCanvasContext.font = '18px Arial';
        this.screenCanvasContext.fillText('Based on your wiring and selections the thermostat will be', 10, this.screenMapTopOffset + 80);
        this.screenCanvasContext.fillText('configured to control the following equipment. Press next to', 10, this.screenMapTopOffset + 100);
        this.screenCanvasContext.fillText('continue or back to change your selections.', 10, this.screenMapTopOffset + 120);

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('AC', 100, this.screenMapTopOffset + 170);
        this.screenCanvasContext.fillText('Furnace', 50, this.screenMapTopOffset + 225);
        this.screenCanvasContext.fillText('Accessory', 30, this.screenMapTopOffset + 278);

        this.screenCanvasContext.putImageData(greenButton, 135, this.screenMapTopOffset + 140);
        this.screenCanvasContext.fillText('1 Stage', 140, this.screenMapTopOffset + 168);
        this.screenCanvasContext.putImageData(grayButton, 230, this.screenMapTopOffset + 140);
        this.screenCanvasContext.fillText('2 Stage', 238, this.screenMapTopOffset + 168);
        this.screenCanvasContext.putImageData(grayButton, 325, this.screenMapTopOffset + 140);
        this.screenCanvasContext.fillText('No', 355, this.screenMapTopOffset + 168);

        this.screenCanvasContext.putImageData(grayButton, 135, this.screenMapTopOffset + 195);
        this.screenCanvasContext.fillText('1 Stage', 140, this.screenMapTopOffset + 223);
        this.screenCanvasContext.putImageData(grayButton, 230, this.screenMapTopOffset + 195);
        this.screenCanvasContext.fillText('2 Stage', 238, this.screenMapTopOffset + 223);
        this.screenCanvasContext.putImageData(greenButton, 325, this.screenMapTopOffset + 195);
        this.screenCanvasContext.fillText('No', 355, this.screenMapTopOffset + 223);

        this.screenCanvasContext.putImageData(this.curState['accessoryWiresToAcc'] ? greenButton : grayButton, 135, this.screenMapTopOffset + 250);
        this.screenCanvasContext.fillText('Yes', 160, this.screenMapTopOffset + 278);
        this.screenCanvasContext.putImageData(this.curState['accessoryWiresToAcc'] ? grayButton : greenButton, 230, this.screenMapTopOffset + 250);
        this.screenCanvasContext.fillText('No', 260, this.screenMapTopOffset + 278);

        if (this.curState['accessoryWiresToAcc']) {
            this.backButton('accessoryPowerSourceScreen');
        } else {
            this.backButton('accessoryScreen');
        }

        this.infoButton();
        this.nextButton('myThermostatSetupScreen');


        this.processInteractions();
    }

    myThermostatNameScreen(fromScreen) {
        var self = this;
        this.curScreenActiveElements = [];

        this.screenCanvasContext.strokeStyle = 'white';
        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Select My Thersmostat Name', 100, this.screenMapTopOffset + 40);

        this.screenCanvasContext.lineWidth = 2;
        this.screenCanvasContext.beginPath();
        this.screenCanvasContext.moveTo(0, this.screenMapTopOffset + 60);
        this.screenCanvasContext.lineTo(512, this.screenMapTopOffset + 60);
        this.screenCanvasContext.stroke();

        this.screenCanvasContext.fillStyle = '#3f3c85';
        this.screenCanvasContext.fillRect(0, this.screenMapTopOffset + 65, 450, 60);
        this.screenCanvasContext.fillStyle = 'white';
        this.screenCanvasContext.fillText('My home', 20, this.screenMapTopOffset + 100);
        this.screenCanvasContext.lineWidth = 1;
        this.screenCanvasContext.beginPath();
        this.screenCanvasContext.moveTo(0, this.screenMapTopOffset + 125);
        this.screenCanvasContext.lineTo(450, this.screenMapTopOffset + 125);
        this.screenCanvasContext.moveTo(0, this.screenMapTopOffset + 185);
        this.screenCanvasContext.lineTo(450, this.screenMapTopOffset + 185);
        this.screenCanvasContext.moveTo(0, this.screenMapTopOffset + 245);
        this.screenCanvasContext.lineTo(450, this.screenMapTopOffset + 245);
        this.screenCanvasContext.stroke();

        this.screenCanvasContext.lineWidth = 2;
        this.screenCanvasContext.beginPath();
        this.screenCanvasContext.moveTo(0, this.screenMapTopOffset + 250);
        this.screenCanvasContext.lineTo(512, this.screenMapTopOffset + 250);
        this.screenCanvasContext.stroke();

        if (fromScreen == 'preferencesScreen') {
            this.backButton('preferencesScreen');
            this.infoButton();
            this.nextButton('preferencesScreen', 'Save');
        } else {
            this.backButton('myThermostatSetupScreen');
            this.infoButton();
            this.nextButton('fahrenheitCelsiusScreen');
        }


        this.processInteractions();
    }

    fahrenheitCelsiusScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Do you prefer Fahrenheit to Celsius', 70, this.screenMapTopOffset + 40);

        var grayButton = this.screenAssetsCanvasContext.getImageData(270, 1, 87, 43);
        var greenButton = this.screenAssetsCanvasContext.getImageData(270, 43, 87, 43);

        this.screenCanvasContext.putImageData(this.curState['fahrenheitOrCelsius'] == 'F' ? greenButton : grayButton, 210, this.screenMapTopOffset + 130);
        this.screenCanvasContext.putImageData(this.curState['fahrenheitOrCelsius'] == 'C' ? greenButton : grayButton, 210, this.screenMapTopOffset + 180);

        this.screenCanvasContext.font = 'bold 14px Arial';
        this.screenCanvasContext.fillText('Fahrenheit', 216, this.screenMapTopOffset + 155);
        this.curScreenActiveElements.push({
            name: 'fahrenheitButton',
            rect: [210, this.screenMapTopOffset + 130, 85, 40],
            onTouch: function() {
                self.curState['fahrenheitOrCelsius'] = 'F';
                self.switchScreen('fahrenheitCelsiusScreen');
            }
        });

        this.screenCanvasContext.fillText('Celsius', 220, this.screenMapTopOffset + 205);
        this.curScreenActiveElements.push({
            name: 'celsiusButton',
            rect: [210, this.screenMapTopOffset + 180, 85, 40],
            onTouch: function() {
                self.curState['fahrenheitOrCelsius'] = 'C';
                self.switchScreen('fahrenheitCelsiusScreen');
            }
        });

        this.backButton('myThermostatNameScreen');
        this.infoButton();
        this.nextButton('setIdealHomeTemperatureScreen');


        this.processInteractions();
    }

    setIdealHomeTemperatureScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.curState['Preferences'] = true;

        this.screenCanvasContext.fillStyle = 'white';

        var upButton = this.screenAssetsCanvasContext.getImageData(825, 1, 78, 56);
        var downButton = this.screenAssetsCanvasContext.getImageData(825, 57, 78, 56);

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Set Your Ideal Home Temperature', 70, this.screenMapTopOffset + 40);

        this.putTemperatureLabel(130, this.screenMapTopOffset + 125, this.curState['idealHomeTemperatureWinter']);
        this.screenCanvasContext.font = '14px Arial';
        this.screenCanvasContext.fillText('in winter', 130, this.screenMapTopOffset + 150);
        this.putTemperatureLabel(320, this.screenMapTopOffset + 125, this.curState['idealHomeTemperatureSummer']);
        this.screenCanvasContext.font = '14px Arial';
        this.screenCanvasContext.fillText('in summer', 315, this.screenMapTopOffset + 150);

        this.screenCanvasContext.putImageData(upButton, 120, this.screenMapTopOffset + 160);
        this.screenCanvasContext.putImageData(upButton, 310, this.screenMapTopOffset + 160);
        this.screenCanvasContext.putImageData(downButton, 120, this.screenMapTopOffset + 221);
        this.screenCanvasContext.putImageData(downButton, 310, this.screenMapTopOffset + 221);

        this.curScreenActiveElements.push({
            name: 'idealHomeTemperatureWinterUpButton',
            rect: [120, this.screenMapTopOffset + 160, 79, 57],
            onTouch: function() {
                self.curState['idealHomeTemperatureWinter'] += 1;
                self.switchScreen('setIdealHomeTemperatureScreen');
            }
        });
        this.curScreenActiveElements.push({
            name: 'idealHomeTemperatureWinterDownButton',
            rect: [120, this.screenMapTopOffset + 221, 79, 57],
            onTouch: function() {
                self.curState['idealHomeTemperatureWinter'] -= 1;
                self.switchScreen('setIdealHomeTemperatureScreen');
            }
        });
        this.curScreenActiveElements.push({
            name: 'idealHomeTemperatureSummerUpButton',
            rect: [310, this.screenMapTopOffset + 160, 79, 57],
            onTouch: function() {
                self.curState['idealHomeTemperatureSummer'] += 1;
                self.switchScreen('setIdealHomeTemperatureScreen');
            }
        });
        this.curScreenActiveElements.push({
            name: 'idealHomeTemperatureSummerDownButton',
            rect: [310, this.screenMapTopOffset + 221, 79, 57],
            onTouch: function() {
                self.curState['idealHomeTemperatureSummer'] -= 1;
                self.switchScreen('setIdealHomeTemperatureScreen');
            }
        });

        this.backButton('fahrenheitCelsiusScreen');
        this.infoButton();
        this.nextButton('myThermostatSetupScreen');


        this.processInteractions();
    }

    baseScreen(initObj) {
        var self = this;
        this.curScreenActiveElements = [];

        this.screenCanvasContext.fillStyle = 'white';

        var date = new Date();
        var aDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Fan: ' + this.curState['fanMode'], 10, this.screenMapTopOffset + 20);
        this.screenCanvasContext.fillText(
            aDays[date.getDay()] + ' ' +
            ((date.getHours() > 12 ? date.getHours() - 12 : date.getHours()) < 10 ? '0'+(date.getHours() > 12 ? date.getHours() - 12 : date.getHours()) : (date.getHours() > 12 ? date.getHours() - 12 : date.getHours()))+':'+
            (date.getMinutes() < 10 ? '0'+date.getMinutes() : date.getMinutes())+':'+
            (date.getSeconds() < 10 ? '0'+date.getSeconds() : date.getSeconds())+' '+
            (date.getHours() >= 12 ? "PM" : "AM"), 185, this.screenMapTopOffset + 20);
        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Mode: ' + this.curState['mainMode'], 390, this.screenMapTopOffset + 20);

        if (this.curState['mainMode'] == 'Cool') {
            this.screenCanvasContext.font = '24px Arial';
            this.screenCanvasContext.fillText('Cool Setpoint: ', 160, this.screenMapTopOffset + 80);
            this.putTemperatureLabel(330, this.screenMapTopOffset + 80, this.curState['coolToTemperature'], '24px Arial', (initObj ? false : true));
        } else if (this.curState['mainMode'] == 'Heat') {
            this.screenCanvasContext.font = '24px Arial';
            this.screenCanvasContext.fillText('Heat Setpoint: ', 160, this.screenMapTopOffset + 80);
            this.putTemperatureLabel(330, this.screenMapTopOffset + 80, this.curState['heatToTemperature'], '24px Arial', (initObj ? false : true));
        }

        this.putTemperatureLabel(170, this.screenMapTopOffset + 180, this.curState['roomTemperature'], '90px Arial', (initObj ? false : true));
        this.screenCanvasContext.font = '24px Arial';
        this.screenCanvasContext.fillText(this.curState['roomHumidity'].toString() + '%', 240, this.screenMapTopOffset + 240);

        if (initObj) {
            if (initObj.mode == 'setup') {

                var heatToBG = this.screenAssetsCanvasContext.getImageData(676, 162, 180, 129);
                var heatToButton = this.screenAssetsCanvasContext.getImageData(676, 291, 81, 56);

                var coolToBG = this.screenAssetsCanvasContext.getImageData(676, 347, 180, 129);
                var coolToButton = this.screenAssetsCanvasContext.getImageData(676, 105, 81, 56);

                var upButton = this.screenAssetsCanvasContext.getImageData(825, 1, 78, 56);
                var downButton = this.screenAssetsCanvasContext.getImageData(825, 57, 78, 56);

                if (this.curState['baseScreenSetupMode'] == 'heat') {
                    this.screenCanvasContext.putImageData(heatToBG, 311, this.screenMapTopOffset + 105);
                } else {
                    this.screenCanvasContext.putImageData(coolToBG, 311, this.screenMapTopOffset + 105);
                }

                this.screenCanvasContext.putImageData(coolToButton, 318, this.screenMapTopOffset + 110);
                this.screenCanvasContext.putImageData(heatToButton, 318, this.screenMapTopOffset + 174);

                this.screenCanvasContext.putImageData(upButton, 405, this.screenMapTopOffset + 110);
                this.screenCanvasContext.putImageData(downButton, 405, this.screenMapTopOffset + 171);

                this.screenCanvasContext.font = 'bold 14px Arial';
                this.screenCanvasContext.fillText('COOL TO', 326, this.screenMapTopOffset + 128);
                this.putTemperatureLabel(341, this.screenMapTopOffset + 154, this.curState['coolToTemperature'], 'bold 26px Arial', false);

                this.screenCanvasContext.font = 'bold 14px Arial';
                this.screenCanvasContext.fillText('HEAT TO', 326, this.screenMapTopOffset + 192);
                this.putTemperatureLabel(341, this.screenMapTopOffset + 218, this.curState['heatToTemperature'], 'bold 26px Arial', false);

                this.curScreenActiveElements.push({
                    name: 'heatToButton',
                    rect: [317, this.screenMapTopOffset + 174, 81, 56],
                    onTouch: function() {
                        self.curState['baseScreenSetupMode'] = 'heat';
                        self.switchScreen('baseScreen', { mode: 'setup' });
                    }
                });

                this.curScreenActiveElements.push({
                    name: 'coolToButton',
                    rect: [317, this.screenMapTopOffset + 110, 81, 56],
                    onTouch: function() {
                        self.curState['baseScreenSetupMode'] = 'cool';
                        self.switchScreen('baseScreen', { mode: 'setup' });
                    }
                });

                this.curScreenActiveElements.push({
                    name: 'temperatureUpButton',
                    rect: [405, this.screenMapTopOffset + 110, 79, 57],
                    onTouch: function() {
                        if (self.curState['baseScreenSetupMode'] == 'heat') {
                            self.curState['heatToTemperature'] += 1;
                        } else {
                            self.curState['coolToTemperature'] += 1;
                        }
                        self.switchScreen('baseScreen', { mode: 'setup' });
                    }
                });
                this.curScreenActiveElements.push({
                    name: 'temperatureDownButton',
                    rect: [405, this.screenMapTopOffset + 171, 79, 57],
                    onTouch: function() {
                        if (self.curState['baseScreenSetupMode'] == 'heat') {
                            self.curState['heatToTemperature'] -= 1;
                        } else {
                            self.curState['coolToTemperature'] -= 1;
                        }
                        self.switchScreen('baseScreen', { mode: 'setup' });
                    }
                });
            }

            if (initObj.mode == 'fanMotorMode') {
                this.screenCanvasContext.fillStyle = '#b7e0ff';
                this.screenCanvasContext.fillRect(0, this.screenMapTopOffset, 120, 30);
                
                this.screenCanvasContext.beginPath();

                this.screenCanvasContext.moveTo(0, this.screenMapTopOffset + 30);
                this.screenCanvasContext.lineTo(120, this.screenMapTopOffset + 30);
                this.screenCanvasContext.moveTo(120, this.screenMapTopOffset);
                this.screenCanvasContext.lineTo(120, this.screenMapTopOffset + 30);

                this.screenCanvasContext.moveTo(0, this.screenMapTopOffset + 60);
                this.screenCanvasContext.lineTo(120, this.screenMapTopOffset + 60);
                this.screenCanvasContext.moveTo(120, this.screenMapTopOffset + 60);
                this.screenCanvasContext.lineTo(120, this.screenMapTopOffset + 30);

                this.screenCanvasContext.lineWidth = 2;
                this.screenCanvasContext.strokeStyle = '#927eb6';
                this.screenCanvasContext.stroke();

                this.screenCanvasContext.fillStyle = '#ffffff';
                this.screenCanvasContext.font = 'bold 20px Arial';
                this.screenCanvasContext.fillText('Fan: ' + this.curState['fanMode'], 10, this.screenMapTopOffset + 20);
                this.screenCanvasContext.fillText((this.curState['fanMode'] == 'Auto' ? 'On' : 'Auto'), (this.curState['fanMode'] == 'Auto' ? 45 : 40), this.screenMapTopOffset + 50);

                this.curScreenActiveElements.push({
                    name: 'fanMotorModeOption1',
                    rect: [0, this.screenMapTopOffset + 30, 120, 30],
                    onTouch: function() {
                        self.curState['fanMode'] = self.curState['fanMode'] == 'Auto' ? 'On' : 'Auto';
                        self.switchScreen('baseScreen');
                    }
                });
            }

            if (initObj.mode == 'mainMode') {
                this.screenCanvasContext.fillStyle = '#b7e0ff';
                this.screenCanvasContext.fillRect(380, this.screenMapTopOffset, 150, 30);

                this.screenCanvasContext.beginPath();

                this.screenCanvasContext.moveTo(380, this.screenMapTopOffset + 30);
                this.screenCanvasContext.lineTo(530, this.screenMapTopOffset + 30);

                this.screenCanvasContext.moveTo(380, this.screenMapTopOffset + 60);
                this.screenCanvasContext.lineTo(530, this.screenMapTopOffset + 60);

                this.screenCanvasContext.moveTo(380, this.screenMapTopOffset + 90);
                this.screenCanvasContext.lineTo(530, this.screenMapTopOffset + 90);

                this.screenCanvasContext.moveTo(380, this.screenMapTopOffset + 120);
                this.screenCanvasContext.lineTo(530, this.screenMapTopOffset + 120);

                this.screenCanvasContext.moveTo(380, this.screenMapTopOffset + 150);
                this.screenCanvasContext.lineTo(530, this.screenMapTopOffset + 150);

                this.screenCanvasContext.moveTo(380, this.screenMapTopOffset + 150);
                this.screenCanvasContext.lineTo(380, this.screenMapTopOffset);

                this.screenCanvasContext.moveTo(530, this.screenMapTopOffset + 150);
                this.screenCanvasContext.lineTo(530, this.screenMapTopOffset);

                this.screenCanvasContext.lineWidth = 2;
                this.screenCanvasContext.strokeStyle = '#927eb6';
                this.screenCanvasContext.stroke();

                this.screenCanvasContext.fillStyle = '#ffffff';
                this.screenCanvasContext.font = 'bold 20px Arial';
                this.screenCanvasContext.fillText('Mode: ' + this.curState['mainMode'], 390, this.screenMapTopOffset + 20);

                this.screenCanvasContext.fillText('Heat', 430, this.screenMapTopOffset + 50);
                this.curScreenActiveElements.push({
                    name: 'mainModeHeat',
                    rect: [430, this.screenMapTopOffset + 30, 150, 30],
                    onTouch: function() {
                        self.curState['mainMode'] = 'Heat';
                        self.switchScreen('baseScreen');
                    }
                });
                this.screenCanvasContext.fillText('Cool', 430, this.screenMapTopOffset + 80);
                this.curScreenActiveElements.push({
                    name: 'mainModeHeat',
                    rect: [430, this.screenMapTopOffset + 60, 150, 30],
                    onTouch: function() {
                        self.curState['mainMode'] = 'Cool';
                        self.switchScreen('baseScreen');
                    }
                });
                this.screenCanvasContext.fillText('Auto', 430, this.screenMapTopOffset + 110);
                this.curScreenActiveElements.push({
                    name: 'mainModeHeat',
                    rect: [430, this.screenMapTopOffset + 90, 150, 30],
                    onTouch: function() {
                        self.curState['mainMode'] = 'Auto';
                        self.switchScreen('baseScreen');
                    }
                });
                this.screenCanvasContext.fillText('Off', 435, this.screenMapTopOffset + 140);
                this.curScreenActiveElements.push({
                    name: 'mainModeHeat',
                    rect: [430, this.screenMapTopOffset + 120, 150, 30],
                    onTouch: function() {
                        self.curState['mainMode'] = 'Off';
                        self.switchScreen('baseScreen');
                    }
                });
            }

            if (this.baseScreenResetTimer === undefined) {
                this.baseScreenResetTimer = setTimeout(() => {
                    self.baseScreenResetTimer = undefined;
                    self.switchScreen('baseScreen');
                }, 10000);
            }
        } else {
            this.curScreenActiveElements.push({
                name: 'baseScreenArealButton',
                rect: [20, this.screenMapTopOffset + 40, 470, 260],
                onTouch: function() {
                    self.switchScreen('baseScreen', { mode: 'setup' });
                }
            });
        }

        this.curScreenActiveElements.push({
            name: 'fanMotorMode',
            rect: [10, this.screenMapTopOffset, 120, 30],
            onTouch: function() {
                if (initObj && initObj.mode == 'fanMotorMode') {
                    self.switchScreen('baseScreen');
                } else {
                    self.switchScreen('baseScreen', { mode: 'fanMotorMode' });
                }
            }
        });

        this.curScreenActiveElements.push({
            name: 'mainMode',
            rect: [390, this.screenMapTopOffset, 120, 30],
            onTouch: function() {
                if (initObj && initObj.mode == 'mainMode') {
                    self.switchScreen('baseScreen');
                } else {
                    self.switchScreen('baseScreen', { mode: 'mainMode' });
                }
            }
        });

        // this.backButton('baseScreen');
        this.infoButton();
        // this.nextButton('menuScreen', 'Menu', 80);

        this.processInteractions();

        var self = this;
        this.curState['baseScreenTimer'] = setTimeout(() => {
            self.switchScreen('baseScreen', initObj);
        }, 1000);
    }

    menuScreen() {
        var self = this;
        this.curScreenActiveElements = [];

        this.screenCanvasContext.fillStyle = 'white';

        var profilesIcon = this.screenAssetsCanvasContext.getImageData(1, 104, 100, 120);
        var schedulesIcon = this.screenAssetsCanvasContext.getImageData(101, 104, 100, 120);
        var vacationIcon = this.screenAssetsCanvasContext.getImageData(201, 104, 100, 120);
        var settingsIcon = this.screenAssetsCanvasContext.getImageData(1, 224, 100, 120);
        var weatherIcon = this.screenAssetsCanvasContext.getImageData(101, 224, 100, 120);
        var alertsIcon = this.screenAssetsCanvasContext.getImageData(201, 224, 100, 120);
        var systemIcon = this.screenAssetsCanvasContext.getImageData(302, 224, 100, 120);
        var serviceIcon = this.screenAssetsCanvasContext.getImageData(907, 1, 100, 120);

        this.screenCanvasContext.putImageData(profilesIcon, 0, this.screenMapTopOffset + 20);
        this.screenCanvasContext.putImageData(schedulesIcon, 130, this.screenMapTopOffset + 20);
        this.screenCanvasContext.putImageData(vacationIcon, 260, this.screenMapTopOffset + 20);
        this.screenCanvasContext.putImageData(settingsIcon, 390, this.screenMapTopOffset + 20);
        this.screenCanvasContext.putImageData(weatherIcon, 10, this.screenMapTopOffset + 150);
        this.screenCanvasContext.putImageData(alertsIcon, 130, this.screenMapTopOffset + 150);
        this.screenCanvasContext.putImageData(systemIcon, 260, this.screenMapTopOffset + 150);
        this.screenCanvasContext.putImageData(serviceIcon, 390, this.screenMapTopOffset + 150);

        this.curScreenActiveElements.push({
            name: 'profilesIconButton',
            rect: [5, this.screenMapTopOffset + 20, 110, 125],
            onTouch: function() {
                console.log('profilesIconButton');
            }
        });
        this.curScreenActiveElements.push({
            name: 'schedulesIconButton',
            rect: [125, this.screenMapTopOffset + 20, 115, 125],
            onTouch: function() {
                console.log('schedulesIconButton');
            }
        });
        this.curScreenActiveElements.push({
            name: 'vacationIconButton',
            rect: [255, this.screenMapTopOffset + 20, 115, 125],
            onTouch: function() {
                console.log('vacationIconButton');
            }
        });
        this.curScreenActiveElements.push({
            name: 'settingsIconButton',
            rect: [385, this.screenMapTopOffset + 20, 115, 125],
            onTouch: function() {
                self.switchScreen('settingsScreen');
            }
        });
        this.curScreenActiveElements.push({
            name: 'weatherIconButton',
            rect: [5, this.screenMapTopOffset + 150, 110, 125],
            onTouch: function() {
                console.log('weatherIconButton');
            }
        });
        this.curScreenActiveElements.push({
            name: 'alertsIconButton',
            rect: [125, this.screenMapTopOffset + 150, 115, 125],
            onTouch: function() {
                console.log('alertsIconButton');
            }
        });
        this.curScreenActiveElements.push({
            name: 'systemIconButton',
            rect: [255, this.screenMapTopOffset + 150, 115, 125],
            onTouch: function() {
                console.log('systemIconButton');
            }
        });
        this.curScreenActiveElements.push({
            name: 'serviceIconButton',
            rect: [385, this.screenMapTopOffset + 150, 115, 125],
            onTouch: function() {
                console.log('serviceIconButton');
            }
        });

        this.screenCanvasContext.strokeStyle = 'white';
        this.screenCanvasContext.lineWidth = 2;
        this.screenCanvasContext.beginPath();
        this.screenCanvasContext.moveTo(0, this.screenMapTopOffset + 290);
        this.screenCanvasContext.lineTo(512, this.screenMapTopOffset + 290);
        this.screenCanvasContext.stroke();

        this.backButton('baseScreen');
        this.infoButton();
        this.nextButton('baseScreen', 'Done', 80);

        this.processInteractions();
    }

    settingsScreen(scrollPage = 1) {
        var self = this;
        this.curScreenActiveElements = [];

        var scrollUpIcon = this.screenAssetsCanvasContext.getImageData(627, 104, 46, 34);
        var scrollDownIcon = this.screenAssetsCanvasContext.getImageData(627, 139, 46, 34);

        this.screenCanvasContext.strokeStyle = 'white';
        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Settings', 215, this.screenMapTopOffset + 30);

        this.screenCanvasContext.lineWidth = 2;
        this.screenCanvasContext.beginPath();
        this.screenCanvasContext.moveTo(0, this.screenMapTopOffset + 40);
        this.screenCanvasContext.lineTo(512, this.screenMapTopOffset + 40);
        this.screenCanvasContext.stroke();


        this.screenCanvasContext.strokeStyle = '#949494';
        this.screenCanvasContext.lineWidth = 0.5;
        this.screenCanvasContext.beginPath();
        this.screenCanvasContext.moveTo(5, this.screenMapTopOffset + 105);
        this.screenCanvasContext.lineTo(450, this.screenMapTopOffset + 105);
        this.screenCanvasContext.moveTo(5, this.screenMapTopOffset + 155);
        this.screenCanvasContext.lineTo(450, this.screenMapTopOffset + 155);
        this.screenCanvasContext.moveTo(5, this.screenMapTopOffset + 205);
        this.screenCanvasContext.lineTo(450, this.screenMapTopOffset + 205);
        this.screenCanvasContext.stroke();


        if (scrollPage == 1) {
            this.screenCanvasContext.font = 'bold 20px Arial';
            this.screenCanvasContext.fillText('Register thermostat', 10, this.screenMapTopOffset + 85);
            this.screenCanvasContext.fillText('Preferences', 10, this.screenMapTopOffset + 135);
            this.screenCanvasContext.fillText('Access control', 10, this.screenMapTopOffset + 185);
            this.screenCanvasContext.fillText('Wi-Fi', 10, this.screenMapTopOffset + 235);

            this.screenCanvasContext.font = 'bold 35px Arial';
            this.screenCanvasContext.fillText('>', 430, this.screenMapTopOffset + 140);

            this.screenCanvasContext.putImageData(scrollDownIcon, 460, this.screenMapTopOffset + 240);
            this.curScreenActiveElements.push({
                name: 'scrollDownButton',
                rect: [460, this.screenMapTopOffset + 240, 46, 34],
                onTouch: function() {
                    self.switchScreen('settingsScreen', 2);
                }
            });

            this.curScreenActiveElements.push({
                name: 'preferencesItem',
                rect: [5, this.screenMapTopOffset + 110, 400, 42],
                onTouch: function() {
                    self.switchScreen('preferencesScreen');
                }
            });

        } else {
            this.screenCanvasContext.font = 'bold 20px Arial';
            this.screenCanvasContext.fillText('Time & locaiton', 10, this.screenMapTopOffset + 85);
            this.screenCanvasContext.fillText('Reset', 10, this.screenMapTopOffset + 135);

            this.screenCanvasContext.putImageData(scrollUpIcon, 460, this.screenMapTopOffset + 60);
            this.curScreenActiveElements.push({
                name: 'scrollUpButton',
                rect: [460, this.screenMapTopOffset + 60, 46, 34],
                onTouch: function() {
                    self.switchScreen('settingsScreen', 1);
                }
            });
        }

        this.screenCanvasContext.strokeStyle = 'white';
        this.screenCanvasContext.lineWidth = 2;
        this.screenCanvasContext.beginPath();
        this.screenCanvasContext.moveTo(0, this.screenMapTopOffset + 280);
        this.screenCanvasContext.lineTo(512, this.screenMapTopOffset + 280);
        this.screenCanvasContext.stroke();

        this.backButton('menuScreen');
        this.infoButton();
        this.nextButton('baseScreen', 'Done', 80);


        this.processInteractions();
    }

    preferencesScreen(scrollPage = 1) {
        var self = this;
        this.curScreenActiveElements = [];

        var scrollUpIcon = this.screenAssetsCanvasContext.getImageData(627, 104, 46, 34);
        var scrollDownIcon = this.screenAssetsCanvasContext.getImageData(627, 139, 46, 34);

        this.screenCanvasContext.strokeStyle = 'white';
        this.screenCanvasContext.fillStyle = 'white';

        this.screenCanvasContext.font = 'bold 20px Arial';
        this.screenCanvasContext.fillText('Preferences', 200, this.screenMapTopOffset + 30);

        this.screenCanvasContext.lineWidth = 2;
        this.screenCanvasContext.beginPath();
        this.screenCanvasContext.moveTo(0, this.screenMapTopOffset + 40);
        this.screenCanvasContext.lineTo(512, this.screenMapTopOffset + 40);
        this.screenCanvasContext.stroke();


        this.screenCanvasContext.strokeStyle = '#949494';
        this.screenCanvasContext.lineWidth = 0.5;
        this.screenCanvasContext.beginPath();
        this.screenCanvasContext.moveTo(5, this.screenMapTopOffset + 105);
        this.screenCanvasContext.lineTo(450, this.screenMapTopOffset + 105);
        this.screenCanvasContext.moveTo(5, this.screenMapTopOffset + 155);
        this.screenCanvasContext.lineTo(450, this.screenMapTopOffset + 155);
        this.screenCanvasContext.moveTo(5, this.screenMapTopOffset + 205);
        this.screenCanvasContext.lineTo(450, this.screenMapTopOffset + 205);
        this.screenCanvasContext.stroke();


        if (scrollPage == 1) {
            this.screenCanvasContext.font = 'bold 20px Arial';
            this.screenCanvasContext.fillText('Thermostat name', 10, this.screenMapTopOffset + 85);
            this.screenCanvasContext.fillText('Default Touch-N-Go hold time', 10, this.screenMapTopOffset + 135);
            this.screenCanvasContext.fillText('Screen brightness', 10, this.screenMapTopOffset + 185);
            this.screenCanvasContext.fillText('Active to standby timer', 10, this.screenMapTopOffset + 235);

            // this.screenCanvasContext.font = 'bold 35px Arial';
            // this.screenCanvasContext.fillText('>', 430, this.screenMapTopOffset + 140);

            this.curScreenActiveElements.push({
                name: 'thermostatNameItem',
                rect: [5, this.screenMapTopOffset + 60, 400, 42],
                onTouch: function() {
                    self.switchScreen('myThermostatNameScreen', 'preferencesScreen');
                }
            });

            this.screenCanvasContext.putImageData(scrollDownIcon, 460, this.screenMapTopOffset + 240);
            this.curScreenActiveElements.push({
                name: 'scrollDownButton',
                rect: [460, this.screenMapTopOffset + 240, 46, 34],
                onTouch: function() {
                    self.switchScreen('preferencesScreen', 2);
                }
            });
        } else {
            // this.screenCanvasContext.font = 'bold 20px Arial';
            // this.screenCanvasContext.fillText('Time & locaiton', 10, this.screenMapTopOffset + 85);
            // this.screenCanvasContext.fillText('Reset', 10, this.screenMapTopOffset + 135);

            this.screenCanvasContext.putImageData(scrollUpIcon, 460, this.screenMapTopOffset + 60);
            this.curScreenActiveElements.push({
                name: 'scrollUpButton',
                rect: [460, this.screenMapTopOffset + 60, 46, 34],
                onTouch: function() {
                    self.switchScreen('preferencesScreen', 1);
                }
            });
        }

        this.screenCanvasContext.strokeStyle = 'white';
        this.screenCanvasContext.lineWidth = 2;
        this.screenCanvasContext.beginPath();
        this.screenCanvasContext.moveTo(0, this.screenMapTopOffset + 280);
        this.screenCanvasContext.lineTo(512, this.screenMapTopOffset + 280);
        this.screenCanvasContext.stroke();

        this.backButton('settingsScreen');
        this.infoButton();
        this.nextButton('baseScreen', 'Done', 80);


        this.processInteractions();
    }

}