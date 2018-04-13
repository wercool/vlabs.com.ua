import * as THREE               from 'three';
import * as TWEEN               from 'tween.js';
import * as DOMUtils            from '../../vlabs.core/utils/dom.utils.js';

var OrbitControls           = require('../../vlabs.core/three-orbit-controls/index')(THREE);

export default class DetailedView {
    /*
    initObj {
        "context": VLab
    }
    */
    constructor(initObj) {
        this.initObj = initObj;
        this.context = initObj.context;

        this.mouseCoordsRaycaster = new THREE.Vector2();
        this.iteractionRaycaster = new THREE.Raycaster();

        this.items = {};

        this.paused = true;

        var textureLoader = new THREE.TextureLoader();

        Promise.all([
            textureLoader.load('../vlabs.assets/img/detailed-view.png'),
            textureLoader.load('../vlabs.assets/envmaps/hdriEnvMap1.jpg')
        ])
        .then((result) => {
            this.handlerSpriteTexture = result[0];

            this.envMap = result[1];
            this.envMap.mapping = THREE.EquirectangularReflectionMapping;

            this.initialize();
        })
        .catch(error => {
            console.error(error);
        });

        this.clock = new THREE.Clock();
    }

    initialize() {

        this.container = document.createElement('div');
        this.container.id = this.initObj.targetObjectName + 'DetailedViewContainer';
        this.container.className = 'detailedViewContainer';
        this.container.style.display = 'none';
        
        this.context.overlayContainer.appendChild(this.container);

        this.closeBtn = document.createElement('div');
        this.closeBtn.id = this.initObj.targetObjectName + 'detailedViewCloseButton';
        this.closeBtn.className = 'detailedViewCloseButton';
        this.container.appendChild(this.closeBtn);
        this.closeBtn.addEventListener("mousedown", this.close.bind(this), false);
        this.closeBtn.addEventListener("touchend", this.close.bind(this), false);

        var handlerSpriteMaterial = new THREE.SpriteMaterial({
            map: this.handlerSpriteTexture,
            color: 0x00ff00,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.5,
            rotation: 0.0,
            depthTest: true,
            depthWrite: true
        });

        this.handlerSprite = new THREE.Sprite(handlerSpriteMaterial);
        this.handlerSprite.name = this.initObj.targetObjectName + "DetailedViewSprite"
        this.handlerSprite.scale.copy(this.initObj.scale ? this.initObj.scale : new THREE.Vector3(1.0, 1.0, 1.0));
        this.handlerSprite.position.x += this.initObj.positionDeltas ? this.initObj.positionDeltas.x : 0.0;
        this.handlerSprite.position.y += this.initObj.positionDeltas ? this.initObj.positionDeltas.y : 0.0;
        this.handlerSprite.position.z += this.initObj.positionDeltas ? this.initObj.positionDeltas.z : 0.0;

        var animationScale = this.handlerSprite.scale.x * 0.75;
        this.handlerSpritePulsation = new TWEEN.Tween(this.handlerSprite.scale)
        .to({x: animationScale, y: animationScale, z: animationScale}, 2000)
        .repeat(Infinity)
        .yoyo(true)
        .easing(TWEEN.Easing.Quadratic.InOut).start();

        if (this.initObj.parent) {
            this.targetObject = this.initObj.parent.getObjectByName(this.initObj.targetObjectName);
        } else {
            this.targetObject = this.context.vLabScene.getObjectByName(this.initObj.targetObjectName);
        }

        this.targetObject.add(this.handlerSprite);

        //VLab events subscribers
        this.context.webGLContainerEventsSubcribers.mouseup["DetailedView" + this.initObj.targetObjectName + "vLabSceneMouseUp"] = 
        {
            callback: this.onVLabSceneMouseUp,
            instance: this
        };
        this.context.webGLContainerEventsSubcribers.touchend["DetailedView" + this.initObj.targetObjectName + "vLabSceneTouchEnd"] = 
        {
            callback: this.onVLabSceneTouchEnd,
            instance: this
        };

        //WebGL
        this.webGLContainer = document.createElement('div');
        this.webGLContainer.id = this.initObj.targetObjectName + 'detailedViewWebGLContainer';
        this.webGLContainer.className = 'detailedViewWebGLContainer';
        this.container.appendChild(this.webGLContainer);

        this.webGLRenderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance',
            precision: 'lowp'
        });

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

        window.addEventListener('resize', function(event){
            this.resiezeWebGLContainer();
        }.bind(this));

        // Scenes
        this.scene = new THREE.Scene();

        // Lights
        var ambient = new THREE.AmbientLight(0xffffff, 0.65);
        this.scene.add(ambient);
        var spotLight1 = new THREE.PointLight(0xffffff, 0.75);
        spotLight1.position.set(0.0, 0.5, 2.0);
        this.scene.add(spotLight1);

        //Cameras
        this.defaultCamera = new THREE.PerspectiveCamera(60, this.webGLContainer.clientWidth / this.webGLContainer.clientHeight, 0.01, 10.0);
        if (this.initObj.defaultCameraInitialPosition) {
            this.defaultCamera.position.copy(this.initObj.defaultCameraInitialPosition);
        } else {
            this.defaultCamera.position.set(0, 0.0, 0.25);
        }

        this.defaultAudioListener = new THREE.AudioListener();
        this.defaultCamera.add(this.defaultAudioListener);

        //Controls
        this.controls = new OrbitControls(this.defaultCamera);
        this.controls.minDistance = this.initObj.controls.minDistance ? this.initObj.controls.minDistance : 0.25;
        this.controls.maxDistance = this.initObj.controls.maxDistance ? this.initObj.controls.maxDistance : 1.0;
        this.controls.minPolarAngle = this.initObj.controls.minPolarAngle ? this.initObj.controls.minPolarAngle : 0.0;
        this.controls.maxPolarAngle = this.initObj.controls.maxPolarAngle ? this.initObj.controls.maxPolarAngle : Math.PI * 2;
        this.controls.enablePan = true;

        // Materials

        // EnvSphere
        var envSphereGeometry = new THREE.SphereBufferGeometry(2.0, 60, 40);
        // invert the geometry on the x-axis so that all of the faces point inward
        envSphereGeometry.scale(-1, 1, 1);

        var envSpehreMaterial = new THREE.MeshBasicMaterial( {
            map: this.envMap
        } );

        this.envSpehreMesh = new THREE.Mesh(envSphereGeometry, envSpehreMaterial);
        this.envSpehreMesh.name = "envSpehreMesh";
        this.scene.add(this.envSpehreMesh);

        console.log("DetailedView initialized for " + this.initObj.targetObjectName);
    }

    resiezeWebGLContainer() {
        this.webGLRenderer.setSize(this.webGLContainer.clientWidth, this.webGLContainer.clientHeight);

        if (this.defaultCamera) {
            this.defaultCamera.aspect = (this.webGLContainer.clientWidth / this.webGLContainer.clientHeight);
            this.defaultCamera.updateProjectionMatrix();
        }
    }


    onVLabSceneMouseUp(event) {
        // console.log("DetailedView" + this.initObj.targetObjectName + "vLabSceneMouseUp", event.type);
        this.interactionEvent();
    }

    onVLabSceneTouchEnd(event) {
        // console.log("DetailedView" + this.initObj.targetObjectName + "vLabSceneTouchEnd", event.type);
        this.interactionEvent();
    }

    interactionEvent() {
        if (this.initObj.context.defaultCameraControls.type !== 'orbit' || this.initObj.context.paused) {
            return;
        }
        this.initObj.context.helpersRaycaster.setFromCamera(this.initObj.context.mouseCoordsRaycaster, this.initObj.context.defaultCamera);

        var intersectObjects = this.context.interactivesSuppressorsObjects.slice();
        intersectObjects.push(this.handlerSprite);

        var intersects = this.initObj.context.helpersRaycaster.intersectObjects(intersectObjects);

        if (intersects.length > 0) {
            if (intersects[0].object.name == this.handlerSprite.name) {
                console.log(intersects[0].object.name);
                this.activate();
            }
        }
    }

    activate() {
        let activating = false;
        //Initialize non-initialized yet Detailed View VLab Items
        for (var itemName in this.items) {
            if (this.items[itemName].initialized === false) {
                this.items[itemName].initialize().then((vLabItem) => {
                    this.activate();
                });
                activating = true;
            }
        }
        if (activating) {
            console.log("Items in the Detailed View are initialized...");
            return;
        }

        this.context.paused = true;

        this.context.statsTHREE.domElement.style.display = 'none';
        if (this.context.toolboxBtn) {
            this.context.toolboxBtn.style.display = 'none';
        }

        this.context.fullscreenButton.style.display = 'none';
        this.context.resetViewButton.style.display = 'none';

        this.context.modalMessage.style.display = 'none';
        this.context.progressBarElement.style.display = 'none';

        if (this.context.zoomHelperMode) {
            this.context.backFromViewButton.style.display = 'none';
        }

        this.context.overlayContainer.style.display = 'block';
        this.container.style.display = 'block';

        for (var itemName in this.items) {
            if (this.items[itemName].onOpen) {
                this.items[itemName].onOpen.call(this.items[itemName], {  });
            }
        }

        this.paused = false;
        this.resiezeWebGLContainer();
        this.render();
    }

    close() {

        this.paused = true;

        this.container.style.display = 'none';
        this.context.overlayContainer.style.display = 'none';

        this.context.paused = false;
        this.context.statsTHREE.domElement.style.display = 'block';
        if (this.context.toolboxBtn) {
            this.context.toolboxBtn.style.display = 'block';
        }

        this.context.fullscreenButton.style.display = 'block';
        this.context.resetViewButton.style.display = 'block';

        if (this.context.zoomHelperMode) {
            setTimeout(() => {
                this.context.backFromViewButton.style.display = 'block';
            }, 250)
        }

        this.context.mouseCoordsRaycaster.set(-1.0, -1.0);

        for (var itemName in this.items) {
            if (this.items[itemName].onClose) {
                this.items[itemName].onClose.call(this.items[itemName], {  });
            }
        }

        console.log(this.initObj.targetObjectName + " Detailed View closed");
    }

    render(time) {
        if (!this.paused) {
            this.webGLRenderer.clear();

            this.controls.update();

            this.webGLRenderer.render(this.scene, this.defaultCamera);

            for (var itemName in this.items) {
                if (this.items[itemName].onDetailedViewRenderFrameEvent) {
                    this.items[itemName].onDetailedViewRenderFrameEvent.call(this.items[itemName], { clockDelta: this.clock.getDelta() });
                }
            }

            requestAnimationFrame(this.render.bind(this));
        } else {
            setTimeout(this.render.bind(this), 500);
        }
    }

    addVLabItem(vLabItem) {
        if (vLabItem.itemName) {
            this.items[vLabItem.itemName] = vLabItem;
        }

        if (vLabItem.model) {
            this.scene.add(vLabItem.model);
        }

        if (vLabItem.setupEnvMaterials) {
            vLabItem.setupEnvMaterials.call(vLabItem, {
                envMap: this.envMap
            });
        }
        if (vLabItem.prepareInitialState) {
            vLabItem.prepareInitialState.call(vLabItem);
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
        var webGLContainerOffset = DOMUtils.cumulativeDOMElementOffset(this.webGLContainer);
        this.mouseCoordsRaycaster.set(((event.touches[0].clientX - webGLContainerOffset.left) / this.webGLContainer.clientWidth) * 2 - 1, 1 -((event.touches[0].clientY - webGLContainerOffset.top) / this.webGLContainer.clientHeight) * 2);
        this.mouseDown = true;
    }

    onTouchEnd(event) {
        event.preventDefault();
        this.releaseGesture();
    }

    releaseGesture() {
        this.mouseDown = false;
        for (var itemName in this.items) {
            if (this.items[itemName].onReleaseGesture) {
                this.items[itemName].onReleaseGesture.call(this.items[itemName], {});
            }
        }
    }
}