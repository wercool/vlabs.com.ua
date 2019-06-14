import * as THREE from 'three';
import * as WebWorkerUtils from '../../../vlab.fwk/utils/web.worker.utils';

import NavKinectRGBDWebSocketMessage from '../slam/model/nav-kinect-rgbd-websocket-message';

/**
 * Valter SLAM class.
 * @class
 * @classdesc Valter The Robot SLAM methods.
 */
class ValterSLAM {
    /**
     * Initializtion
     * @param {*} initObj 
     */
    constructor(initObj) {
        this.name = 'ValterSLAM';

        this.Valter = initObj.Valter;

        this.vLab = this.Valter.vLab;

        console.log('Valter SLAM');

        /**
         * VLabsRESTWSValterRGBDMessageService
         */
        this.vLab.VLabsRESTClientManager
        .VLabsRESTWSValterRGBDMessageService
        .connect();

        this.rgbdSize = new THREE.Vector2(128, 128);
        // this.rgbdSize = new THREE.Vector2(320, 240);
        // this.rgbdSize = new THREE.Vector2(160, 120);
        this.kinectCameraAspect = 640 / 480;

        /**
         * Kinect RGB camera
         */
        this.slamKinectRGBCameraOffset = new THREE.Vector3(-0.005, 0.307, 0.209);
        this.slamKinectRGBCamera = new THREE.PerspectiveCamera(49, this.kinectCameraAspect, 0.2, 25.0);
        this.slamKinectRGBCameraVFOV = THREE.Math.degToRad(this.slamKinectRGBCamera.fov);
        this.slamKinectRGBCameraHFOV = 2 * Math.atan(Math.tan(this.slamKinectRGBCameraVFOV / 2) * this.slamKinectRGBCamera.aspect);
        this.slamKinectRGBCameraHFOVDiv2 = this.slamKinectRGBCameraHFOV / 2;
        this.slamKinectRGBCameraVFOVDiv2 = this.slamKinectRGBCameraVFOV / 2;
        this.slamKinectRGBCamera.updateProjectionMatrix();
        this.vLab.SceneDispatcher.currentVLabScene.add(this.slamKinectRGBCamera);

        /**
         * Kinect depth camera setup
         */
        this.slamKinectDepthRaycaster = new THREE.Raycaster();
        this.slamKinectDepthRaycaster.near = 0.5;
        this.slamKinectDepthRaycaster.far = 3.0;

        // this.slamKinectDepthRaycasterArrowHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 1.0, 0xffffff, 0.02, 0.01);
        // this.vLab.SceneDispatcher.currentVLabScene.add(this.slamKinectDepthRaycasterArrowHelper);

        // this.slamKinectRGBCameraHelper = new THREE.CameraHelper(this.slamKinectRGBCamera);
        // this.vLab.SceneDispatcher.currentVLabScene.add(this.slamKinectRGBCameraHelper);

        /**
         * Kinect RGB camera renderer canvas
         */
        this.slamKinectRGBCameraRendererCanvas = document.createElement('canvas');
        this.slamKinectRGBCameraRendererCanvas.style.position = 'absolute';
        this.slamKinectRGBCameraRendererCanvas.style.left = 'calc(50% - ' + this.rgbdSize.x + 'px)'
        this.slamKinectRGBCameraRendererCanvas.style.zIndex = 3;
        this.slamKinectRGBCameraRendererCanvas.width = this.rgbdSize.x;
        this.slamKinectRGBCameraRendererCanvas.height = this.rgbdSize.y;
        this.slamKinectRGBCameraRendererCanvas.style.visibility = 'hidden';

        this.vLab.DOMManager.container.appendChild(this.slamKinectRGBCameraRendererCanvas);

        /**
         * Kinect Depth image canvas
         */
        this.slamKinectRGBCameraDepthImageCanvas = document.createElement('canvas');
        this.slamKinectRGBCameraDepthImageCanvas.style.position = 'absolute';
        this.slamKinectRGBCameraDepthImageCanvas.style.left = '50%';
        this.slamKinectRGBCameraDepthImageCanvas.style.zIndex = 3;
        this.slamKinectRGBCameraDepthImageCanvas.width = this.rgbdSize.x;
        this.slamKinectRGBCameraDepthImageCanvas.height = this.rgbdSize.y;
        this.slamKinectRGBCameraDepthImageCanvas.style.visibility = 'hidden';
        this.slamKinectRGBCameraDepthImageCanvasCtx = this.slamKinectRGBCameraDepthImageCanvas.getContext('2d');

        this.vLab.DOMManager.container.appendChild(this.slamKinectRGBCameraDepthImageCanvas);

        this.WebGLRenderer = new THREE.WebGLRenderer({
            canvas: this.slamKinectRGBCameraRendererCanvas,
            antialias: true,
            powerPreference: 'high-performance',
            precision: 'lowp',
            preserveDrawingBuffer: true
        });
        this.WebGLRenderer.context.getShaderInfoLog = function () { return '' };
        this.WebGLRenderer.context.getProgramInfoLog = function () { return '' };
        this.WebGLRenderer.gammaOutput = true;

        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                WebGLRendererCanvas: {
                    framerequest: this.onWebGLRendererCanvasFramerequest
                }
            }
        });

        // let pos = this.slamKinectRGBCameraOffset.clone().add(new THREE.Vector3(0.0, 0.0, 1.0));
        // let geometry = new THREE.SphereGeometry( 0.01, 32, 32 );
        // let material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        // this.testSphere = new THREE.Mesh( geometry, material );
        // this.Valter.bodyFrame.add(this.testSphere);

        this.getNavKinectRGBDWebSocketMessage = this.getNavKinectRGBDWebSocketMessage.bind(this);

        this.getNavKinectRGBDWebSocketMessageEnabled = false;

        this.Valter.getInteractableByName('baseFrame').DEV.menu.unshift(
            {
                label: 'Get ' + this.rgbdSize.x + 'x' + this.rgbdSize.y + ' RGBD Image from navigation Kinect',
                enabled: true,
                selected: false,
                icon: '<i class=\"material-icons\">cast_connected</i>',
                action: (menuItem) => {
                    this.slamKinectRGBCameraRendererCanvas.style.visibility = 'visible';
                    this.slamKinectRGBCameraDepthImageCanvas.style.visibility = 'visible';
                    this.initializeRGBDScanning(1.0);
                }
            }
        );

        this.Valter.getInteractableByName('baseFrame').DEV.menu.unshift(
            {
                label: 'Get RGBD Image from navigation Kinect',
                enabled: true,
                selected: false,
                icon: '<i class=\"material-icons\">cast</i>',
                action: (menuItem) => {
                    if (!this.getNavKinectRGBDWebSocketMessageEnabled) {
                        this.slamKinectRGBCameraRendererCanvas.style.visibility = 'visible';
                        this.slamKinectRGBCameraDepthImageCanvas.style.visibility = 'visible';
                        this.getNavKinectRGBDWebSocketMessageEnabled = true;
                        menuItem.selected = true;
                        this.initializeRGBDScanning();
                    } else {
                        this.getNavKinectRGBDWebSocketMessageEnabled = false;
                        menuItem.selected = false;
                    }
                }
            }
        );

        /**
         * 
         * sendNavKinectRGBDWebSocketMessageWorker
         * 
         */
        this.sendNavKinectRGBDWebSocketMessageWorker = WebWorkerUtils.createInlineWorker(function (event) {
            // console.log(event.data);
            if (self.socket == undefined) {
                self.socket = new WebSocket(event.data.socketURL);
                self.socket.onopen = function (event){
                    self.socketConnected = true;
                };
            }
            if (self.socketConnected == true) {
                self.socket.send(JSON.stringify(event.data.navKinectRGBDWebSocketMessage));
            }
            // self.postMessage('NavKinectRGBDWebSocketMessage SENT');
        });

        this.sendNavKinectRGBDWebSocketMessageWorker.onMessage = function (event) {
            console.log(event.data);
        }

        this.meshDepthMaterial = new THREE.MeshDepthMaterial();
    }

    onWebGLRendererCanvasFramerequest(event) {
        this.slamKinectRGBCamera.position.copy(this.slamKinectRGBCameraOffset);
        this.slamKinectRGBCamera.position.applyMatrix4(this.Valter.bodyFrame.matrixWorld);
        this.slamKinectRGBCameraLookAt = this.Valter.bodyFrame.localToWorld(this.slamKinectRGBCameraOffset.clone().setZ(1.0));
        this.slamKinectRGBCamera.lookAt(this.slamKinectRGBCameraLookAt);
    }

    initializeRGBDScanning(depthImageThrottling) {
        this.depthImageThrottling = depthImageThrottling ? depthImageThrottling : 6.0;
        this.depthImageThrottling += 0.0001;

        this.slamKinectDepthRaycasterHAngleDelta = this.slamKinectRGBCameraHFOV / (this.rgbdSize.x / this.depthImageThrottling);
        this.slamKinectDepthRaycasterVAngleDelta = this.slamKinectRGBCameraVFOV / (this.rgbdSize.y / this.depthImageThrottling);

        this.sceneIntersectionMeshes = [];
        this.vLab.SceneDispatcher.currentVLabScene.traverse((sceneObject) => {
            if (sceneObject instanceof THREE.Mesh) {
                if (sceneObject.name.indexOf('_OUTLINE') == -1) {
                    if (this.Valter.selfMeshes.indexOf(sceneObject) == -1) {
                        this.sceneIntersectionMeshes.push(sceneObject);
                    }
                }
            }
        });
        console.log('sceneIntersectionMeshes: ' + this.sceneIntersectionMeshes.length);

        this.getNavKinectRGBDWebSocketMessage();
    }

    getNavKinectRGBDWebSocketMessage() {
        this.WebGLRenderer.render(this.vLab.SceneDispatcher.currentVLabScene, this.slamKinectRGBCamera);

        this.vLab.renderPaused = true;

        // this.slamKinectRGBCamera.updateMatrix();
        // this.slamKinectRGBCamera.updateMatrixWorld();
        // var slamKinectRGBCameraFrustum = new THREE.Frustum();
        // slamKinectRGBCameraFrustum.setFromMatrix(new THREE.Matrix4().multiplyMatrices(this.slamKinectRGBCamera.projectionMatrix, this.slamKinectRGBCamera.matrixWorldInverse));
        // let meshesInslamKinectRGBCameraFrustum = [];
        // this.sceneIntersectionMeshes.forEach((mesh) => {
        //     if (mesh.geometry.boundingSphere) {
        //         if (slamKinectRGBCameraFrustum.intersectsSphere(mesh.geometry.boundingSphere)) {
        //             meshesInslamKinectRGBCameraFrustum.push(mesh);
        //         }
        //     }
        // });

        /**
         * Raycaster scanning for Depth image
         */
        let depthImageValues = [];

        let curHAngle = this.slamKinectRGBCameraHFOVDiv2;
        let curVAngle = this.slamKinectRGBCameraVFOVDiv2;
        while (curVAngle + this.slamKinectDepthRaycasterVAngleDelta > -this.slamKinectRGBCameraVFOVDiv2) {
            while (curHAngle + this.slamKinectDepthRaycasterHAngleDelta > -this.slamKinectRGBCameraHFOVDiv2) {
                let x = this.slamKinectRGBCamera.far * Math.tan(curHAngle);
                let y = this.slamKinectRGBCamera.far * Math.tan(curVAngle);
                let z = this.slamKinectRGBCamera.far;

                curHAngle -= this.slamKinectDepthRaycasterHAngleDelta;

                this.slamKinectDepthRaycasterDirectionOffset = new THREE.Vector3(x, y, z);
                this.slamKinectDepthRaycasterDirection = this.Valter.bodyFrame.localToWorld(this.slamKinectRGBCameraOffset.clone().add(this.slamKinectDepthRaycasterDirectionOffset)).sub(this.slamKinectRGBCamera.position.clone()).normalize();

                /*
                this.slamKinectDepthRaycasterArrowHelper.position.copy(this.slamKinectRGBCamera.position);
                this.slamKinectDepthRaycasterArrowHelper.setDirection(this.slamKinectDepthRaycasterDirection);
                let slamKinectDepthRaycasterArrowHelperLength = this.Valter.bodyFrame.localToWorld(this.slamKinectRGBCameraOffset.clone().add(this.slamKinectDepthRaycasterDirectionOffset)).distanceTo(this.slamKinectRGBCamera.position.clone());
                this.slamKinectDepthRaycasterArrowHelper.setLength(slamKinectDepthRaycasterArrowHelperLength, 0.02, 0.01);
                */

                this.slamKinectDepthRaycaster.set(this.slamKinectRGBCamera.position, this.slamKinectDepthRaycasterDirection);

                let slamKinectDepthRaycasterIntersects = this.slamKinectDepthRaycaster.intersectObjects(this.sceneIntersectionMeshes);
                if (slamKinectDepthRaycasterIntersects[0]) {
                    let normalizedDistance = (slamKinectDepthRaycasterIntersects[0].distance - this.slamKinectDepthRaycaster.near) / (this.slamKinectDepthRaycaster.far - this.slamKinectDepthRaycaster.near);
                    normalizedDistance *= Math.cos(curHAngle);
                    normalizedDistance *= Math.cos(curVAngle);
                    depthImageValues.push(normalizedDistance);
                } else {
                    depthImageValues.push(1.0);
                }
            }
            curHAngle = this.slamKinectRGBCameraHFOV / 2;
            curVAngle -= this.slamKinectDepthRaycasterVAngleDelta;
        }

        this.slamKinectRGBCameraDepthImageCanvasCtx.fillStyle = '#000000';
        this.slamKinectRGBCameraDepthImageCanvasCtx.fillRect(0, 0, this.slamKinectRGBCameraDepthImageCanvas.width, this.slamKinectRGBCameraDepthImageCanvas.height);
        let x = 0;
        let y = 0;
        let depthImageThrottlingInt = Math.round(this.depthImageThrottling);
        depthImageValues.forEach((depth) => {
            let depthPixel = this.slamKinectRGBCameraDepthImageCanvasCtx.createImageData(depthImageThrottlingInt, depthImageThrottlingInt);
            for (let i = 0; i < depthPixel.data.length; i += 4) {
                depthPixel.data[i + 0] = 255 - 255 * depth;
                depthPixel.data[i + 1] = 255 - 255 * depth;
                depthPixel.data[i + 2] = 255 - 255 * depth;
                depthPixel.data[i + 3] = 255;
            }
            this.slamKinectRGBCameraDepthImageCanvasCtx.putImageData(depthPixel, x, y);
            if (x < this.rgbdSize.x) {
                x += depthImageThrottlingInt;
            } else {
                y += depthImageThrottlingInt;
                x = 0;
            }
        });

        this.vLab.renderPaused = false;

        if (this.getNavKinectRGBDWebSocketMessageEnabled) {
            this.sendNavKinectRGBDWebSocketMessage()
            .then(() => {
                setTimeout(this.getNavKinectRGBDWebSocketMessage, 250);
            });
        }
    }

    sendNavKinectRGBDWebSocketMessage() {
        return new Promise((resolve) => {
            /**
             * RGB image
             */
            let navKinectRGBImageData = this.slamKinectRGBCameraRendererCanvas.toDataURL();
            /**
             * Depth image
             */
            let navKinectDepthImageData = this.slamKinectRGBCameraDepthImageCanvas.toDataURL();
            /**
             * Send NavKinectRGBDWebSocketMessage to VLabsRESTWS
             */
            let navKinectRGBDWebSocketMessage = new NavKinectRGBDWebSocketMessage();
            navKinectRGBDWebSocketMessage.rgbImageData = navKinectRGBImageData;
            navKinectRGBDWebSocketMessage.depthImageData = navKinectDepthImageData;

            // this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.send(navKinectRGBDWebSocketMessage);

            this.sendNavKinectRGBDWebSocketMessageWorker.postMessage({
                socketURL: this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.getFullyQualifiedURL(),
                navKinectRGBDWebSocketMessage: navKinectRGBDWebSocketMessage
            });

            resolve();
        });
    }
}
export default ValterSLAM;