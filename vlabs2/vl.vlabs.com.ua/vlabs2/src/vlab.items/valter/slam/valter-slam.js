import * as THREE from 'three';

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

        this.WebGLRenderer = new THREE.WebGLRenderer({
            alpha: false,
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


    }

    onWebGLRendererCanvasFramerequest(event) {
        this.slamKinectRGBDCamera.position.copy(this.slamKinectRGBDCameraOffset);
        this.slamKinectRGBDCamera.position.applyMatrix4(this.Valter.bodyFrame.matrixWorld);
        this.slamKinectRGBDCameraLookAt = this.Valter.bodyFrame.localToWorld(this.slamKinectRGBDCameraOffset.clone().setZ(1.0));
        this.slamKinectRGBDCamera.lookAt(this.slamKinectRGBDCameraLookAt);

        this.slamKinectDepthCamera.position.copy(this.slamKinectRGBDCamera.position);
        this.slamKinectDepthCamera.lookAt(this.slamKinectRGBDCameraLookAt);
    }

    /**
     * Render RGB and Depth images
     * @param {*} event 
     */
    renderRGBD() {
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
    }
}
export default ValterSLAM;