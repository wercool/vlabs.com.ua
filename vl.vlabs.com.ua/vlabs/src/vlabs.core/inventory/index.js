import * as THREE               from 'three';
import * as DOMUtils            from '../../vlabs.core/utils/dom.utils.js';

var OrbitControls           = require('../../vlabs.core/three-orbit-controls/index')(THREE);

export default class Inventory {
    /*
    initObj {
        "context": VLab
    }
    */
    constructor(initObj) {
        this.initObj = initObj;
        this.context = initObj.context;

        this.paused = true;

        this.items = {};
        this.currentItemIdx = 0;

        this.mouseCoordsRaycaster = new THREE.Vector2();
        this.iteractionRaycaster = new THREE.Raycaster();

        this.initialize();
    }

    initialize() {
        this.context.toolboxBtn = document.createElement('div');
        this.context.toolboxBtn.id = this.context.name + 'Toolbox';
        this.context.toolboxBtn.className = 'toolbox';

        this.context.webGLContainer.appendChild(this.context.toolboxBtn);

        this.context.toolboxBtn.addEventListener("mousedown", this.activate.bind(this), false);
        this.context.toolboxBtn.addEventListener("touchstart", this.activate.bind(this), false);

        window.addEventListener('resize', function(event){
            this.resiezeWebGLContainer();
        }.bind(this));

        this.container = document.createElement('div');
        this.container.id = this.context.name + 'InventoryContainer';
        this.container.className = 'inventoryContainer';
        this.context.overlayContainer.appendChild(this.container);

        this.webGLContainer = document.createElement('div');
        this.webGLContainer.id = this.context.name + 'InventoryWebGLContainer';
        this.webGLContainer.className = 'inventoryWebGLContainer';

        this.container.appendChild(this.webGLContainer);

        this.webGLRenderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance',
            precision: 'lowp'
        });
        this.webGLRenderer.setClearColor(0x214761);

        this.webGLContainer.addEventListener("mousemove", this.onMouseMove.bind(this), false);
        this.webGLContainer.addEventListener("mousedown", this.onMouseDown.bind(this), false);
        this.webGLContainer.addEventListener("mouseup", this.onMouseUp.bind(this), false);
        this.webGLContainer.addEventListener("touchstart", this.onTouchStart.bind(this), false);
        this.webGLContainer.addEventListener("touchend", this.onTouchEnd.bind(this), false);

        this.webGLContainer.appendChild(this.webGLRenderer.domElement);
        this.webGLRenderer.domElement.addEventListener('contextmenu', function(event) {
            if (event.button == 2) {
                event.preventDefault();
            }
        });

        this.scene = new THREE.Scene();
        this.defaultCamera = new THREE.PerspectiveCamera(70, this.webGLContainer.clientWidth / this.webGLContainer.clientHeight, 0.01, 5.0);

        this.defaultCameraControls = new OrbitControls(this.defaultCamera, this.webGLContainer, new THREE.Vector3(0, 0.2, 0.25));
        this.defaultCameraControls.enablePan = true;
        this.defaultCameraControls.minDistance = 0.1;
        this.defaultCameraControls.maxDistance = 0.35;
        this.defaultCameraControls.maxPolarAngle = Math.PI;
        this.defaultCameraControls.minPolarAngle = 0.0;
        this.defaultCameraControls.autoRotate = true;

        var light0 = new THREE.AmbientLight(0xffffff, 0.35);
        this.scene.add(light0);

        var light1 = new THREE.PointLight(0xffffff, 1.5);
        light1.position.set(0.0, 1.0, 3.0);
        this.scene.add(light1);

        this.infoBox = document.createElement('div');
        this.infoBox.id = this.context.name + 'InventoryInfoBox';
        this.infoBox.className = 'inventoryInfoBox';
        this.container.appendChild(this.infoBox);

        this.closeBtn = document.createElement('div');
        this.closeBtn.id = this.context.name + 'InventoryCloseButton';
        this.closeBtn.className = 'inventoryCloseButton';
        this.container.appendChild(this.closeBtn);
        this.closeBtn.addEventListener("mousedown", this.close.bind(this), false);

        this.nextItemButton = document.createElement('div');
        this.nextItemButton.id = this.context.name + 'InventoryNextItemButton';
        this.nextItemButton.className = 'inventoryNextItemButton';
        this.container.appendChild(this.nextItemButton);
        this.nextItemButton.addEventListener("mousedown", this.setNextItem.bind(this), false);

        this.prevItemButton = document.createElement('div');
        this.prevItemButton.id = this.context.name + 'InventoryPrevItemButton';
        this.prevItemButton.className = 'inventoryPrevItemButton';
        this.container.appendChild(this.prevItemButton);
        this.prevItemButton.addEventListener("mousedown", this.setPrevItem.bind(this), false);

        this.takeButton = document.createElement('div');
        this.takeButton.id = this.context.name + 'InventoryTakeButton';
        this.takeButton.className = 'inventoryTakeButton';
        var takeIcon = document.createElement('li');
        takeIcon.className = "fa fa-hand-rock";
        this.takeButton.appendChild(takeIcon);
        this.container.appendChild(this.takeButton);
        this.takeButton.addEventListener("mousedown", this.takeItem.bind(this), false);

        console.log(this.context.name + " Inventory initialization");
    }

    activate() {
        this.context.paused = true;

        this.context.fullscreenButton.style.display = 'none';
        this.context.resetViewButton.style.display = 'none';
        this.context.modalMessage.style.display = 'none';
        this.context.progressBarElement.style.display = 'none';
        this.context.statsTHREE.domElement.style.display = 'none';
        this.context.toolboxBtn.style.display = 'none';

        this.defaultCameraControls.initialState = true;
        this.defaultCameraControls.object.position.copy(new THREE.Vector3(0, 0.2, 0.35));

        this.container.style.display = 'block';
        this.context.overlayContainer.style.display = 'block';
        
        var itemsKeys = Object.keys(this.items);
        if (itemsKeys.length > 0) {
            this.takeButton.style.display = 'block';
        } else {
            this.takeButton.style.display = 'none';
        }

        this.paused = false;
        this.resiezeWebGLContainer();
        this.render();
    }


    resiezeWebGLContainer() {
        this.webGLRenderer.setSize(this.webGLContainer.clientWidth, this.webGLContainer.clientHeight);

        if (this.defaultCamera) {
            this.defaultCamera.aspect = (this.webGLContainer.clientWidth / this.webGLContainer.clientHeight);
            this.defaultCamera.updateProjectionMatrix();
        }
    }

    render(time) {
        if (!this.paused) {
            this.webGLRenderer.clear();

            this.defaultCameraControls.update();

            var itemsKeys = Object.keys(this.items);
            if (this.items[itemsKeys[this.currentItemIdx]].vLabItem) {
                if (this.items[itemsKeys[this.currentItemIdx]].vLabItem.redererInventoryFrameEventHandler) {
                    this.items[itemsKeys[this.currentItemIdx]].vLabItem.redererInventoryFrameEventHandler(time);
                }
            }

            this.webGLRenderer.render(this.scene, this.defaultCamera);
            requestAnimationFrame(this.render.bind(this));
        } else {
            setTimeout(this.render.bind(this), 500);
        }
    }

    close() {
        this.paused = false;
        this.container.style.display = 'none';
        this.context.overlayContainer.style.display = 'none';

        this.context.paused = false;
        this.context.statsTHREE.domElement.style.display = 'block';
        this.context.toolboxBtn.style.display = 'block';

        this.context.fullscreenButton.style.display = 'block';
        this.context.resetViewButton.style.display = 'block';

        console.log(this.context.name + " Inventory closed");
    }

    addItem(itemObj) {
        this.scene.add(itemObj.item);
        this.items[itemObj.item.name] = itemObj;
        this.setCurrentItem(itemObj);
        if (itemObj.vLabItem) {
            if (itemObj.vLabItem.deleteVLabEventListeners) {
                itemObj.vLabItem.deleteVLabEventListeners();
            }
        }
    }

    setCurrentItem(itemObj) {
        var currentItemIdx = 0;
        for (var itemName in this.items) {
            if (itemName !== itemObj.item.name) {
                this.scene.getObjectByName(itemName).visible = false;
            } else {
                this.currentItemIdx = currentItemIdx;
                this.scene.getObjectByName(itemName).visible = true;
            }
            currentItemIdx++;
        }

        this.prevItemButton.style.display = 'block';
        this.nextItemButton.style.display = 'block';

        if (this.currentItemIdx == 0) {
            this.prevItemButton.style.display = 'none';
        }

        if (this.currentItemIdx == Object.keys(this.items).length - 1) {
            this.nextItemButton.style.display = 'none';
        }

        this.infoBox.innerHTML = '';

        for (var objectMenuItem of this.context.nature.objectMenus[itemObj.item.name][this.context.nature.lang]) {
            if (objectMenuItem.title == 'Info') {
                this.infoBox.innerHTML = '<h4 style="color: white;">' + objectMenuItem.args.title + '</h4>' + objectMenuItem.args.html;
            }
        }

        this.defaultCameraControls.initialState = true;
        this.defaultCameraControls.object.position.copy(new THREE.Vector3(0, 0.2, 0.25));
        this.defaultCameraControls.target.copy(itemObj.item.position);
    }

    setPrevItem() {
        this.currentItemIdx--;
        var itemsKeys = Object.keys(this.items);
        console.log(itemsKeys[this.currentItemIdx]);
        var prevItemObj = this.items[itemsKeys[this.currentItemIdx]];
        this.setCurrentItem(prevItemObj);
    }

    setNextItem() {
        this.currentItemIdx++;
        var itemsKeys = Object.keys(this.items);
        var nextItemObj = this.items[itemsKeys[this.currentItemIdx]];
        this.setCurrentItem(nextItemObj);
    }

    takeItem() {
        var itemsKeys = Object.keys(this.items);
        var takenItem = this.items[itemsKeys[this.currentItemIdx]].item;
        takenItem.userData["initObj"] = this.items[itemsKeys[this.currentItemIdx]].initObj;
        takenItem.userData["VLabItem"] = this.items[itemsKeys[this.currentItemIdx]].vLabItem;
        if (takenItem.userData["VLabItem"].addVLabEventListeners) {
            takenItem.userData["VLabItem"].addVLabEventListeners();
        }
        this.context.vLabScene.add(takenItem);

        if (this.items[itemsKeys[this.currentItemIdx]].initObj.interactive) {
            this.context.addSelectionHelperToObject(takenItem);
            this.context.nature.interactiveObjects.push(takenItem.name);
            this.context.setInteractiveObjects();
        }

        this.context.selectedObject = takenItem;
        this.context.takeObject();
        delete this.items[takenItem.name];
        this.close();

        var itemsKeys = Object.keys(this.items);
        if (itemsKeys.length > 0) {
            this.setCurrentItem(this.items[itemsKeys[0]]);
        } else {
            this.infoBox.innerHTML = '<div style="width: 100%; text-align: center; color: white; font-size: 48pt;">INVENTORY IS EMPTY</div>';
        }
    }

    onMouseMove(event) {
        var webGLContainerOffset = DOMUtils.cumulativeDOMElementOffset(this.webGLContainer);
        this.mouseCoordsRaycaster.set(((event.clientX - webGLContainerOffset.left) / this.webGLContainer.clientWidth) * 2 - 1, 1 -((event.clientY - webGLContainerOffset.top) / this.webGLContainer.clientHeight) * 2);
    }

    onMouseDown(event) {
        event.preventDefault();
        var webGLContainerOffset = DOMUtils.cumulativeDOMElementOffset(this.webGLContainer);
        this.mouseCoordsRaycaster.set(((event.clientX - webGLContainerOffset.left) / this.webGLContainer.clientWidth) * 2 - 1, 1 -((event.clientY - webGLContainerOffset.top) / this.webGLContainer.clientHeight) * 2);
        this.mouseDown = true;
    }

    onMouseUp(event) {
        event.preventDefault();
        this.releaseGesture();
    }

    onTouchStart(event) {
        event.preventDefault();
        event.stopPropagation();
        var webGLContainerOffset = DOMUtils.cumulativeDOMElementOffset(this.webGLContainer);
        this.mouseCoordsRaycaster.set(((event.touches[0].clientX - webGLContainerOffset.left) / this.webGLContainer.clientWidth) * 2 - 1, 1 -((event.touches[0].clientY - webGLContainerOffset.top) / this.webGLContainer.clientHeight) * 2);
        this.mouseDown = true;
    }

    onTouchEnd(event) {
        event.preventDefault();
        event.stopPropagation();
        this.releaseGesture();
    }

    releaseGesture() {
        this.mouseDown = false;
        var itemsKeys = Object.keys(this.items);
        if (this.items[itemsKeys[this.currentItemIdx]].vLabItem) {
            if (this.items[itemsKeys[this.currentItemIdx]].vLabItem.mouseUpHandler) {
                this.items[itemsKeys[this.currentItemIdx]].vLabItem.mouseUpHandler(event);
            }
        }
    }
}