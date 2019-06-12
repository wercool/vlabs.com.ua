import * as THREE from 'three';

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

        let kinectCameraAspect = 640 / 480;

        /**
         * Kinect RGB camera
         */
        this.slamKinectRGBCameraOffset = new THREE.Vector3(-0.005, 0.307, 0.209);
        this.slamKinectRGBCamera = new THREE.PerspectiveCamera(49, kinectCameraAspect, 0.2, 1.0);
        this.slamKinectRGBCamera.updateProjectionMatrix();
        this.vLab.SceneDispatcher.currentVLabScene.add(this.slamKinectRGBCamera);

        /**
         * Kinect depth camera setup
         */
        this.slamKinectDepthRaycaster = new THREE.Raycaster();
        this.slamKinectDepthRaycaster.near = 0.5;
        this.slamKinectDepthRaycaster.far = 3.0;

        this.slamKinectDepthRaycasterArrowHelper = new THREE.ArrowHelper(new THREE.Vector3(), new THREE.Vector3(), 1.0, 0xffffff, 0.02, 0.01);
        this.vLab.SceneDispatcher.currentVLabScene.add(this.slamKinectDepthRaycasterArrowHelper);

        this.slamKinectRGBCameraHelper = new THREE.CameraHelper(this.slamKinectRGBCamera);
        this.vLab.SceneDispatcher.currentVLabScene.add(this.slamKinectRGBCameraHelper);

        /**
         * Kinect RGB camera renderer canvas
         */
        this.slamKinectRGBCameraRendererCanvas = document.createElement('canvas');
        this.slamKinectRGBCameraRendererCanvas.style.position = 'absolute';
        this.slamKinectRGBCameraRendererCanvas.style.left = '100px'
        this.slamKinectRGBCameraRendererCanvas.style.zIndex = 3;
        this.slamKinectRGBCameraRendererCanvas.width = 320;
        this.slamKinectRGBCameraRendererCanvas.height = 240;

        this.vLab.DOMManager.container.appendChild(this.slamKinectRGBCameraRendererCanvas);

        this.WebGLRenderer = new THREE.WebGLRenderer({
            canvas: this.slamKinectRGBCameraRendererCanvas,
            antialias: false,
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

        this.sendNavKinectRGBDWebSocketMessage = this.sendNavKinectRGBDWebSocketMessage.bind(this);
        this.sendNavKinectRGBDWebSocketMessageInterval = setInterval(this.sendNavKinectRGBDWebSocketMessage, 250);

        // let pos = this.slamKinectRGBCameraOffset.clone().add(new THREE.Vector3(0.0, 0.0, 1.0));
        // let geometry = new THREE.SphereGeometry( 0.01, 32, 32 );
        // let material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        // let sphere = new THREE.Mesh( geometry, material );
        // sphere.position.copy(pos);
        // this.Valter.bodyFrame.add(sphere);

this.offset = 1.209 * Math.sin(THREE.Math.degToRad(49.0)) - 0.307;
    }

    onWebGLRendererCanvasFramerequest(event) {
        this.Valter.baseFrame.updateMatrixWorld();
        this.slamKinectRGBCamera.position.copy(this.slamKinectRGBCameraOffset);
        this.slamKinectRGBCamera.position.applyMatrix4(this.Valter.bodyFrame.matrixWorld);
        this.slamKinectRGBCameraLookAt = this.Valter.bodyFrame.localToWorld(this.slamKinectRGBCameraOffset.clone().setZ(1.0));
        this.slamKinectRGBCamera.lookAt(this.slamKinectRGBCameraLookAt);

        this.slamKinectDepthRaycasterDirection = this.Valter.bodyFrame.localToWorld(this.slamKinectRGBCameraOffset.clone().add(new THREE.Vector3(0.0, this.offset, 1.0))).sub(this.slamKinectRGBCamera.position.clone()).normalize();

        if (this.slamKinectDepthRaycasterArrowHelper) {
            this.slamKinectDepthRaycasterArrowHelper.position.copy(this.slamKinectRGBCamera.position);
            this.slamKinectDepthRaycasterArrowHelper.setDirection(this.slamKinectDepthRaycasterDirection);
            this.slamKinectDepthRaycasterArrowHelper.setLength(1.0, 0.02, 0.01);
        }
    }

    sendNavKinectRGBDWebSocketMessage() {
        this.WebGLRenderer.render(this.vLab.SceneDispatcher.currentVLabScene, this.slamKinectRGBCamera);

        let navKinectRGBImageData = this.slamKinectRGBCameraRendererCanvas.toDataURL();

        // this.slamKinectDepthRaycaster.set(this.slamKinectRGBCamera.position, this.slamKinectRGBCameraDirection);

        let navKinectRGBDWebSocketMessage = new NavKinectRGBDWebSocketMessage();
        navKinectRGBDWebSocketMessage.rgbImageData = navKinectRGBImageData;

        // this.offset += this.dOffset;
        // console.log(this.offset);

        // this.vLab.VLabsRESTClientManager.VLabsRESTWSValterRGBDMessageService.send(navKinectRGBDWebSocketMessage);
    }
}
export default ValterSLAM;