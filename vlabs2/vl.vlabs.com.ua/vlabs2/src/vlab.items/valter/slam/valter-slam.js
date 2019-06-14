import * as THREE from 'three';
import * as WebWorkerUtils from '../../../vlab.fwk/utils/web.worker.utils';

import NavKinectRGBDWebSocketMessage from './model/nav-kinect-rgbd-websocket-message';

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

        this.rgbdSize = new THREE.Vector2(320, 240);

        this.kinectImageMinDistance = 0.1;
        this.kinectImageMaxDistance = 50.0;

        this.kinectDepthMinDistance = 0.5;
        this.kinectDepthMaxDistance = 3.0;

        /**
         * Kinect RGB camera
         */
        this.slamKinectRGBDCameraOffset = new THREE.Vector3(-0.005, 0.307, 0.209);
        // this.slamKinectRGBDCamera = new THREE.PerspectiveCamera(49, this.rgbdSize.x / this.rgbdSize.y, this.kinectImageMinDistance, this.kinectImageMaxDistance);
        this.slamKinectRGBDCamera = new THREE.OrthographicCamera(-1.0, 1.0, 1.0, -1, this.kinectImageMinDistance, this.kinectImageMaxDistance);
        this.slamKinectRGBDCamera.updateProjectionMatrix();
        this.vLab.SceneDispatcher.currentVLabScene.add(this.slamKinectRGBDCamera);

        // this.slamKinectRGBDCameraHelper = new THREE.CameraHelper(this.slamKinectRGBDCamera);
        // this.vLab.SceneDispatcher.currentVLabScene.add(this.slamKinectRGBDCameraHelper);

        /**
         * Kinect RGB Image canvas
         */
        this.slamKinectRGBImageCanvas = document.createElement('canvas');
        this.slamKinectRGBImageCanvas.style.position = 'absolute';
        this.slamKinectRGBImageCanvas.style.left = 'calc(50% - ' + this.rgbdSize.x + 'px)'
        this.slamKinectRGBImageCanvas.style.zIndex = 3;
        this.slamKinectRGBImageCanvas.width = this.rgbdSize.x;
        this.slamKinectRGBImageCanvas.height = this.rgbdSize.y;
        this.slamKinectRGBImageCanvas.style.visibility = 'hidden';
        this.slamKinectRGBImageCanvasCtx = this.slamKinectRGBImageCanvas.getContext('2d');
        this.vLab.DOMManager.container.appendChild(this.slamKinectRGBImageCanvas);
        /**
         * Kinect Depth Image canvas
         */
        this.slamKinectDepthImageCanvas = document.createElement('canvas');
        this.slamKinectDepthImageCanvas.style.position = 'absolute';
        this.slamKinectDepthImageCanvas.style.left = '50%'
        this.slamKinectDepthImageCanvas.style.zIndex = 3;
        this.slamKinectDepthImageCanvas.width = this.rgbdSize.x;
        this.slamKinectDepthImageCanvas.height = this.rgbdSize.y;
        this.slamKinectDepthImageCanvas.style.visibility = 'hidden';
        this.slamKinectDepthImageCanvasCtx = this.slamKinectDepthImageCanvas.getContext('2d');
        this.vLab.DOMManager.container.appendChild(this.slamKinectDepthImageCanvas);

        this.WebGLRenderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance',
            precision: 'lowp',
            preserveDrawingBuffer: true
        });
        this.WebGLRenderer.setSize(this.rgbdSize.x, this.rgbdSize.y);
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

        this.sendNavKinectRGBDWebSocketMessage = this.sendNavKinectRGBDWebSocketMessage.bind(this);
        this.getNavKinectRGBDWebSocketMessageInterval = undefined;

        this.Valter.getInteractableByName('baseFrame').DEV.menu.unshift(
            {
                label: 'Get RGBD from SLAM Kinect',
                enabled: true,
                selected: false,
                icon: '<i class=\"material-icons\">gradient</i>',
                action: (menuItem) => {
                    if (this.getNavKinectRGBDWebSocketMessageInterval == undefined) {
                        this.slamKinectRGBImageCanvas.style.visibility = 'visible';
                        this.slamKinectDepthImageCanvas.style.visibility = 'visible';
                        menuItem.selected = true;
                        this.getNavKinectRGBDWebSocketMessageInterval = setInterval(this.sendNavKinectRGBDWebSocketMessage, 100);
                    } else {
                        clearInterval(this.getNavKinectRGBDWebSocketMessageInterval);
                        this.getNavKinectRGBDWebSocketMessageInterval = undefined;
                        this.slamKinectRGBImageCanvas.style.visibility = 'hidden';
                        this.slamKinectDepthImageCanvas.style.visibility = 'hidden';
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
            // console.log(event.data.navKinectRGBDWebSocketMessage.rgbImageData.data.length);

            const toDataURL = function (data) {
                return new Promise(resolve => {
                    const reader = new FileReader();
                    reader.addEventListener('load', () => resolve(reader.result));
                    reader.readAsDataURL(data);
                });
            }

            if (self.socket == undefined) {
                self.socket = new WebSocket(event.data.socketURL);
                self.socket.onopen = function (event){
                    self.socketConnected = true;
                };
            }
            if (self.socketConnected == true) {
                let rgbImageCanvas = new OffscreenCanvas(event.data.rgbdSize.x, event.data.rgbdSize.y);
                let rgbImageCanvasCtx = rgbImageCanvas.getContext('2d');
                rgbImageCanvasCtx.putImageData(event.data.navKinectRGBDWebSocketMessage.rgbImageData, 0, 0);

                let depthImageCanvas = new OffscreenCanvas(event.data.rgbdSize.x, event.data.rgbdSize.y);
                let depthImageCanvasCtx = depthImageCanvas.getContext('2d');
                depthImageCanvasCtx.putImageData(event.data.navKinectRGBDWebSocketMessage.depthImageData, 0, 0);

                Promise.all([
                    rgbImageCanvas.convertToBlob().then((rgbImageBlob) => toDataURL(rgbImageBlob)),
                    depthImageCanvas.convertToBlob().then((depthImageBlob) => toDataURL(depthImageBlob))
                ])
                .then((rgbdResult) => {
                    event.data.navKinectRGBDWebSocketMessage.rgbImageData   = rgbdResult[0];
                    event.data.navKinectRGBDWebSocketMessage.depthImageData = rgbdResult[1];

                    self.socket.send(JSON.stringify(event.data.navKinectRGBDWebSocketMessage));
                });
            }
        });
    }

    onWebGLRendererCanvasFramerequest(event) {
        this.slamKinectRGBDCamera.position.copy(this.slamKinectRGBDCameraOffset);
        this.slamKinectRGBDCamera.position.applyMatrix4(this.Valter.bodyFrame.matrixWorld);
        this.slamKinectRGBDCameraLookAt = this.Valter.bodyFrame.localToWorld(this.slamKinectRGBDCameraOffset.clone().setZ(1.0));
        this.slamKinectRGBDCamera.lookAt(this.slamKinectRGBDCameraLookAt);
    }

    sendNavKinectRGBDWebSocketMessage() {
        this.vLab.renderPaused = true;

        /**
         * Kinect RGB Image
         */
        this.slamKinectRGBDCamera.near = this.kinectImageMinDistance;
        this.slamKinectRGBDCamera.far  = this.kinectImageMaxDistance;
        this.slamKinectRGBDCamera.updateProjectionMatrix();
        this.WebGLRenderer.render(this.vLab.SceneDispatcher.currentVLabScene, this.slamKinectRGBDCamera);
        this.slamKinectRGBImageCanvasCtx.drawImage(this.WebGLRenderer.domElement, 0, 0, this.rgbdSize.x, this.rgbdSize.y);

        /**
         * Kinect Depth Image
         */
        this.sceneMeshesForDepthRendering = [];
        this.vLab.SceneDispatcher.currentVLabScene.traverse((sceneObject) => {
            if (sceneObject instanceof THREE.Mesh) {
                if (sceneObject.name.indexOf('_OUTLINE') == -1) {
                    if (this.Valter.selfMeshes.indexOf(sceneObject) == -1) {
                        this.sceneMeshesForDepthRendering.push(sceneObject);
                    }
                }
            }
        });
        this.sceneMeshesForDepthRendering.forEach((sceneMeshForDepthRendering) => {
            sceneMeshForDepthRendering.userData['preDepthRenderingMaterial'] = sceneMeshForDepthRendering.material;
            sceneMeshForDepthRendering.material = new THREE.MeshDepthMaterial();
        });
        this.slamKinectRGBDCamera.near = this.kinectDepthMinDistance;
        this.slamKinectRGBDCamera.far  = this.kinectDepthMaxDistance;
        this.slamKinectRGBDCamera.updateProjectionMatrix();
        this.WebGLRenderer.render(this.vLab.SceneDispatcher.currentVLabScene, this.slamKinectRGBDCamera);
        this.slamKinectDepthImageCanvasCtx.drawImage(this.WebGLRenderer.domElement, 0, 0, this.rgbdSize.x, this.rgbdSize.y);
        this.sceneMeshesForDepthRendering.forEach((sceneMeshForDepthRendering) => {
            sceneMeshForDepthRendering.material = sceneMeshForDepthRendering.userData['preDepthRenderingMaterial'];
            delete sceneMeshForDepthRendering.userData['preDepthRenderingMaterial'];
        });

        this.vLab.renderPaused = false;

        /**
         * Send NavKinectRGBDWebSocketMessage to VLabsRESTWS
         */
        let navKinectRGBDWebSocketMessage = new NavKinectRGBDWebSocketMessage();
        navKinectRGBDWebSocketMessage.rgbImageData   = this.slamKinectRGBImageCanvasCtx.getImageData(0, 0, this.rgbdSize.x, this.rgbdSize.y);
        navKinectRGBDWebSocketMessage.depthImageData = this.slamKinectDepthImageCanvasCtx.getImageData(0, 0, this.rgbdSize.x, this.rgbdSize.y);

        // this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.send(navKinectRGBDWebSocketMessage);

        this.sendNavKinectRGBDWebSocketMessageWorker.postMessage({
            socketURL: this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.getFullyQualifiedURL(),
            navKinectRGBDWebSocketMessage: navKinectRGBDWebSocketMessage,
            rgbdSize: this.rgbdSize
        });
    }
}
export default ValterSLAM;