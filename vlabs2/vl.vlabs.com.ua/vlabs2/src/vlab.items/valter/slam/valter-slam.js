import * as THREE from 'three';
import * as WebWorkerUtils from '../../../vlab.fwk/utils/web.worker.utils';
import * as ImageUtils from '../../../vlab.fwk/utils/image.utils';

import NavKinectRGBDWebSocketMessage from './model/nav-kinect-rgbd-websocket-message';
import SLAMRGBDCmdVelOrientation from './model/slam-rgbd-cmd_vel-orientation';

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

        this.slamKinectRGBCameraMinDistance = 0.1;
        this.slamKinectRGBCameraMaxDistance = 30.0;

        this.slamKinectDepthCameraMinDistance = 0.4;
        this.slamKinectDepthCameraMaxDistance = 4.5;

        this.slamKinectRGBDCameraOffset = new THREE.Vector3(-0.005, 0.307, 0.209);

        /**
         * Kinect RGB camera
         * http://www.smeenk.com/webgl/kinectfovexplorer.html
         */
        this.slamKinectRGBDCamera = new THREE.PerspectiveCamera(46, this.rgbdSize.x / this.rgbdSize.y, this.slamKinectRGBCameraMinDistance, this.slamKinectRGBCameraMaxDistance);
        this.slamKinectRGBDCamera.updateProjectionMatrix();
        this.vLab.SceneDispatcher.currentVLabScene.add(this.slamKinectRGBDCamera);
        /**
         * Kinect Depth camera
         */
        this.slamKinectDepthCamera = new THREE.PerspectiveCamera(46, this.rgbdSize.x / this.rgbdSize.y, this.slamKinectDepthCameraMinDistance, this.slamKinectDepthCameraMaxDistance);
        this.slamKinectDepthCamera.updateProjectionMatrix();
        this.vLab.SceneDispatcher.currentVLabScene.add(this.slamKinectDepthCamera);

        this.slamKinectDepthCameraCameraHelper = new THREE.CameraHelper(this.slamKinectDepthCamera);
        this.vLab.SceneDispatcher.currentVLabScene.add(this.slamKinectDepthCameraCameraHelper);

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

        /**
         * Offscreen canvases
         */
        this.rgbImageOffscreenCanvas = new OffscreenCanvas(this.rgbdSize.x, this.rgbdSize.y);
        this.rgbImageOffscreenCanvasCtx = this.rgbImageOffscreenCanvas.getContext('2d');

        this.depthImageOffscreenCanvas = new OffscreenCanvas(this.rgbdSize.x, this.rgbdSize.y);
        this.depthImageOffscreenCanvasCtx = this.depthImageOffscreenCanvas.getContext('2d');

        this.WebGLRenderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance',
            precision: 'lowp',
            preserveDrawingBuffer: true
        });
        this.WebGLRenderer.setSize(this.rgbdSize.x, this.rgbdSize.y);
        this.WebGLRenderer.context.getShaderInfoLog = function () { return '' };
        this.WebGLRenderer.context.getProgramInfoLog = function () { return '' };
        this.WebGLRenderer.gammaOutput = this.vLab.WebGLRenderer.gammaOutput;
        this.WebGLRenderer.gammaFactor = this.vLab.WebGLRenderer.gammaFactor;

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
                primary: true,
                icon: '<i class=\"material-icons\">gradient</i>',
                action: (menuItem) => {
                    if (this.getNavKinectRGBDWebSocketMessageInterval == undefined) {
                        this.slamKinectRGBImageCanvas.style.visibility = 'visible';
                        this.slamKinectDepthImageCanvas.style.visibility = 'visible';
                        menuItem.selected = true;
                        this.slamRGBDCmdVelOrientationTuples = [];
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
        this.Valter.getInteractableByName('baseFrame').DEV.menu.push(
            {
                label: 'Save SLAMRGBDCmdVelOrientation tuples',
                enabled: true,
                selected: false,
                primary: true,
                icon: '<i class=\"material-icons\">save</i>',
                action: (menuItem) => {
                    this.saveSLAMRGBDCmdVelOrientationTuples();
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

            if (self.socket == undefined) {
                self.socket = new WebSocket(event.data.socketURL);
                self.socket.onopen = function (event){
                    self.socketConnected = true;
                };

                self.toDataURL = function (data) {
                    return new Promise(resolve => {
                        const reader = new FileReader();
                        reader.addEventListener('load', () => resolve(reader.result));
                        reader.readAsDataURL(data);
                    });
                }
                self.rgbImageCanvas = new OffscreenCanvas(event.data.rgbdSize.x, event.data.rgbdSize.y);
                self.rgbImageCanvasCtx = self.rgbImageCanvas.getContext('2d');

                self.depthImageCanvas = new OffscreenCanvas(event.data.rgbdSize.x, event.data.rgbdSize.y);
                self.depthImageCanvasCtx = self.depthImageCanvas.getContext('2d');
            }
            if (self.socketConnected == true) {
                self.rgbImageCanvasCtx.putImageData(event.data.navKinectRGBDWebSocketMessage.rgbImageData, 0, 0);
                self.depthImageCanvasCtx.putImageData(event.data.navKinectRGBDWebSocketMessage.depthImageData, 0, 0);

                Promise.all([
                    self.rgbImageCanvas.convertToBlob().then((rgbImageBlob) => self.toDataURL(rgbImageBlob)),
                    self.depthImageCanvas.convertToBlob().then((depthImageBlob) => self.toDataURL(depthImageBlob))
                ])
                .then((rgbdResult) => {
                    event.data.navKinectRGBDWebSocketMessage.rgbImageData   = rgbdResult[0];
                    event.data.navKinectRGBDWebSocketMessage.depthImageData = rgbdResult[1];

                    self.socket.send(JSON.stringify(event.data.navKinectRGBDWebSocketMessage));
                });
            }
        });

        /**
         * SLAM tuples initialization
         */
        this.slamRGBDCmdVelOrientationTuples = [];
    }

    onWebGLRendererCanvasFramerequest(event) {
        this.slamKinectRGBDCamera.position.copy(this.slamKinectRGBDCameraOffset);
        this.slamKinectRGBDCamera.position.applyMatrix4(this.Valter.bodyFrame.matrixWorld);
        this.slamKinectRGBDCameraLookAt = this.Valter.bodyFrame.localToWorld(this.slamKinectRGBDCameraOffset.clone().setZ(1.0));
        this.slamKinectRGBDCamera.lookAt(this.slamKinectRGBDCameraLookAt);

        this.slamKinectDepthCamera.position.copy(this.slamKinectRGBDCamera.position);
        this.slamKinectDepthCamera.lookAt(this.slamKinectRGBDCameraLookAt);
    }

    sendNavKinectRGBDWebSocketMessage() {
        this.vLab.renderPaused = true;

        this.sceneMeshesForDepthRendering = [];
        this.sceneObjectsExcludedFromRendering = [];
        this.vLab.SceneDispatcher.currentVLabScene.traverse((sceneObject) => {
            if (sceneObject instanceof THREE.Mesh) {
                if (sceneObject.name.indexOf('_OUTLINE') == -1) {
                    if (this.Valter.selfMeshes.indexOf(sceneObject) == -1) {
                        this.sceneMeshesForDepthRendering.push(sceneObject);
                    } else {
                        this.sceneObjectsExcludedFromRendering.push(sceneObject);
                    }
                } else {
                    this.sceneObjectsExcludedFromRendering.push(sceneObject);
                }
            } else {
                if (sceneObject instanceof THREE.Line) {
                    this.sceneObjectsExcludedFromRendering.push(sceneObject);
                }
            }
        });

        this.sceneObjectsExcludedFromRendering.forEach((sceneObjectExcludedFromRendering) => {
            sceneObjectExcludedFromRendering.visible = false;
        });

        /**
         * Kinect RGB Image
         */
        this.WebGLRenderer.render(this.vLab.SceneDispatcher.currentVLabScene, this.slamKinectRGBDCamera);
        this.slamKinectRGBImageCanvasCtx.drawImage(this.WebGLRenderer.domElement, 0, 0, this.rgbdSize.x, this.rgbdSize.y);

        /**
         * Kinect Depth Image
         */
        this.sceneMeshesForDepthRendering.forEach((sceneMeshForDepthRendering) => {
            sceneMeshForDepthRendering.userData['preDepthRenderingMaterial'] = sceneMeshForDepthRendering.material;
            sceneMeshForDepthRendering.material = new THREE.MeshDepthMaterial();
        });

        this.WebGLRenderer.render(this.vLab.SceneDispatcher.currentVLabScene, this.slamKinectDepthCamera);
        this.slamKinectDepthImageCanvasCtx.drawImage(this.WebGLRenderer.domElement, 0, 0, this.rgbdSize.x, this.rgbdSize.y);

        this.sceneMeshesForDepthRendering.forEach((sceneMeshForDepthRendering) => {
            sceneMeshForDepthRendering.material = sceneMeshForDepthRendering.userData['preDepthRenderingMaterial'];
            delete sceneMeshForDepthRendering.userData['preDepthRenderingMaterial'];
        });

        this.sceneObjectsExcludedFromRendering.forEach((sceneObjectExcludedFromRendering) => {
            sceneObjectExcludedFromRendering.visible = true;
        });

        this.vLab.renderPaused = false;

        if (Math.abs(this.Valter.cmd_vel.linear.z) > 0.0 || Math.abs(this.Valter.cmd_vel.angular)) {
            let cmd_vel = {
                linear:  parseFloat((this.Valter.cmd_vel.linear.z / (1 / 60)).toFixed(4)),
                angular: parseFloat(this.Valter.cmd_vel.angular.toFixed(4))
            };
            let orientation = {
                x: parseFloat(this.Valter.baseFrame.position.x.toFixed(3)),
                z: parseFloat(this.Valter.baseFrame.position.z.toFixed(3)),
                r: parseFloat(this.Valter.baseFrame.rotation.y.toFixed(3))
            };
            // console.log(cmd_vel, orientation);

            this.slamKinectRGBImageCanvas.style.outline = 'red 2px solid';
            this.slamKinectDepthImageCanvas.style.outline = 'red 2px solid';

            let rgbJSImageData = this.slamKinectRGBImageCanvasCtx.getImageData(0, 0, this.rgbdSize.x, this.rgbdSize.y);
            let depthJSImageData = this.slamKinectDepthImageCanvasCtx.getImageData(0, 0, this.rgbdSize.x, this.rgbdSize.y);

            /**
             * Save SLAMRGBDCmdVelOrientation tuple
             */
            let slamRGBDCmdVelOrientation = new SLAMRGBDCmdVelOrientation();
            slamRGBDCmdVelOrientation.rgbImageData   = rgbJSImageData;
            slamRGBDCmdVelOrientation.depthImageData = depthJSImageData;
            slamRGBDCmdVelOrientation.cmd_vel_linear  = cmd_vel.linear;
            slamRGBDCmdVelOrientation.cmd_vel_angular = cmd_vel.angular;
            slamRGBDCmdVelOrientation.orientation_x = orientation.x;
            slamRGBDCmdVelOrientation.orientation_z = orientation.z;
            slamRGBDCmdVelOrientation.orientation_r = orientation.r;

            this.slamRGBDCmdVelOrientationTuples.push(slamRGBDCmdVelOrientation);
            console.log(this.slamRGBDCmdVelOrientationTuples.length + ' SLAM tuples accumulated');

            // /**
            //  * Send NavKinectRGBDWebSocketMessage to VLabsRESTWS
            //  */
            // let navKinectRGBDWebSocketMessage = new NavKinectRGBDWebSocketMessage();
            // navKinectRGBDWebSocketMessage.rgbImageData   = rgbJSImageData;
            // navKinectRGBDWebSocketMessage.depthImageData = depthJSImageData;
            // /**
            //  * Send in UI thread
            //  */
            // // this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.send(navKinectRGBDWebSocketMessage);
            // /**
            //  * Send in worker thread
            //  */
            // this.sendNavKinectRGBDWebSocketMessageWorker.postMessage({
            //     socketURL: this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.getFullyQualifiedURL(),
            //     navKinectRGBDWebSocketMessage: navKinectRGBDWebSocketMessage,
            //     rgbdSize: this.rgbdSize
            // });
        } else {
            this.slamKinectRGBImageCanvas.style.outline = '';
            this.slamKinectDepthImageCanvas.style.outline = '';
        }
    }

    async saveSLAMRGBDCmdVelOrientationTuples() {
        let savedCnt = 0;

        Promise.all(this.slamRGBDCmdVelOrientationTuples.map(async (slamRGBDCmdVelOrientationTuple) => {
            await new Promise((resolve) => {
                this.rgbImageOffscreenCanvasCtx.putImageData(slamRGBDCmdVelOrientationTuple.rgbImageData, 0, 0);
                this.depthImageOffscreenCanvasCtx.putImageData(slamRGBDCmdVelOrientationTuple.depthImageData, 0, 0);

                Promise.all([
                    this.rgbImageOffscreenCanvas.convertToBlob().then((rgbImageBlob) => ImageUtils.canvasBlobToDataURL(rgbImageBlob)),
                    this.depthImageOffscreenCanvas.convertToBlob().then((depthImageBlob) => ImageUtils.canvasBlobToDataURL(depthImageBlob))
                ])
                .then((rgbdResult) => {
                    slamRGBDCmdVelOrientationTuple.rgbImageData   = rgbdResult[0];
                    slamRGBDCmdVelOrientationTuple.depthImageData = rgbdResult[1];

                    this.vLab.VLabsRESTClientManager
                    .ValterSLAMService
                    .saveSLAMRGBDCmdVelOrientationTuple(slamRGBDCmdVelOrientationTuple)
                    .then(() => {
                        savedCnt++;
                        console.log(savedCnt + '/' + this.slamRGBDCmdVelOrientationTuples.length + ' SLAM tuples persisted');
                        resolve();
                    });
                });
            });
        }))
        .then(() => {
            this.slamRGBDCmdVelOrientationTuples = [];
        });
    }
}
export default ValterSLAM;