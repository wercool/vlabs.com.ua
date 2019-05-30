import * as THREE from 'three';
import * as VLabUtils from '../../../vlab.fwk/utils/vlab.utils';
/*<dev>*/
var TransformControls = require('three-transform-ctrls');
/*</dev>*/
/**
 * Valter IK class.
 * @class
 * @classdesc Valter The Robot IK methods.
 */
class ValterIK {
    /**
     * Initializtion
     * @param {*} initObj 
     */
    constructor(initObj) {
        this.Valter = initObj.Valter;

        this.vLab = this.Valter.vLab;

        this.helperDragRaycaster = new THREE.Raycaster();

        this.headYawLinkOriginObject3D = new THREE.Object3D();
        this.headYawLinkOriginObject3D.position.copy(this.Valter.headYawLink.position.clone());
        this.Valter.torsoFrame.add(this.headYawLinkOriginObject3D);

        /**
         * Head target
         */
        this.setupHeadTarget();
    }

    setupHeadTargetDirectionFromHeadYawLinkOrigin() {
        /*<dev>*/
        if (this.Valter.kinectHeadDirectionArrowHelperDirection !== undefined) {
            let geometry = new THREE.SphereBufferGeometry(0.015, 8, 8);
            let material = new THREE.MeshBasicMaterial({color: 0x00ff00});
            this.headDirectionTargetObject3D = new THREE.Object3D();
            this.headDirectionTargetObject3D.position.copy(this.Valter.kinectHeadDirectionArrowHelperDirection);
            this.Valter.kinectHead.add(this.headDirectionTargetObject3D);

            this.headDirectionTarget = new THREE.Mesh(geometry, material);
            this.headDirectionTarget.position.copy(this.headDirectionTargetObject3D.position.clone());
            this.Valter.kinectHead.add(this.headDirectionTarget);

            this.Valter.baseFrame.updateMatrixWorld();
            this.headDirectionTargetGlobalPosition = this.Valter.kinectHead.localToWorld(this.headDirectionTargetObject3D.position.clone());
            let headYawLinkHeadTargetLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.headDirectionTargetGlobalPosition.clone());
            let headYawLinkHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(headYawLinkHeadTargetLocalPos);
            this.headDirectionTargetFromHeadYawLinkArrowHelper = new THREE.ArrowHelper(headYawLinkHeadTargetLocalPos.clone().normalize(), new THREE.Vector3(0.0, 0.0, 0.0), headYawLinkHeadTargetDistance, 0xff00ff, 0.02, 0.01);
            this.headYawLinkOriginObject3D.add(this.headDirectionTargetFromHeadYawLinkArrowHelper);

            let headYawLinkOriginObject3DAxis = new TransformControls(this.vLab.SceneDispatcher.currentVLabScene.currentCamera, this.vLab.WebGLRendererCanvas);
            headYawLinkOriginObject3DAxis.setSize(1.0);
            headYawLinkOriginObject3DAxis.setSpace('local');
            headYawLinkOriginObject3DAxis.enabled = false;
            this.vLab.SceneDispatcher.currentVLabScene.add(headYawLinkOriginObject3DAxis);
            headYawLinkOriginObject3DAxis.attach(this.headYawLinkOriginObject3D);
        }
        /*</dev>*/
    }

    updateHeadTargetDirectionFromHeadYawLinkOrigin() {
        /*<dev>*/
        if (this.Valter.nature.devHelpers.showKinectHeadDirection == true) {
            this.Valter.baseFrame.updateMatrixWorld();
            this.headDirectionTargetGlobalPosition = this.Valter.kinectHead.localToWorld(this.headDirectionTargetObject3D.position.clone());

            let headYawLinkHeadTargetLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.headDirectionTargetGlobalPosition.clone());
            let headYawLinkHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(headYawLinkHeadTargetLocalPos);
            this.headYawLinkHeadTargetDirection = headYawLinkHeadTargetLocalPos.clone().normalize();
            this.headYawLinkHeadTargetDirection = new THREE.Vector3(parseFloat(this.headYawLinkHeadTargetDirection.x.toFixed(3)), parseFloat(this.headYawLinkHeadTargetDirection.y.toFixed(3)), parseFloat(this.headYawLinkHeadTargetDirection.z.toFixed(3)));
            this.headDirectionTargetFromHeadYawLinkArrowHelper.setDirection(this.headYawLinkHeadTargetDirection);
            this.headDirectionTargetFromHeadYawLinkArrowHelper.setLength(headYawLinkHeadTargetDistance, 0.02, 0.01);

            //console.log('headYaw = ' + this.Valter.ValterLinks.headYawLink.value.toFixed(3), 'headTilt = ' + this.Valter.ValterLinks.headTiltLink.value.toFixed(3), this.headYawLinkHeadTargetDirection);
        }
        /*</dev>*/
    }
    setupHeadTarget() {
        /**
         * Head target
         */
        var headTargetObjectGeometry = new THREE.SphereBufferGeometry(0.025, 16, 16);
        var headTargetObjectMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true, wireframeLinewidth: 0.0001, transparent: true, opacity: 0.5 });
        this.headTargetObject = new THREE.Mesh(headTargetObjectGeometry, headTargetObjectMaterial);
        this.headTargetObject.name = 'headTargetObject';
        this.vLab.SceneDispatcher.currentVLabScene.add(this.headTargetObject);
        this.vLab.SceneDispatcher.currentVLabScene.addInteractable({
            name: 'headTargetObject',
            intersectable: true,
            preselectable: true,
            action: {
                context: this,
                function: this.headTargetAction,
                manipulator: true,
                activated: true,
                invfunction: this.commonInvAction,
                args: {}
            },
        }).then((headTargetObjectInteractable) => {
            this.headTargetObjectInteractable = headTargetObjectInteractable;
            this.headTargetObjectInteractable.vLabSceneObject.position.copy(this.Valter.baseFrame.position.clone()).add(new THREE.Vector3(0.0, 1.0, 1.0));

            if (this.Valter.nature.devHelpers.showHeadTargetDirectionFromYawLinkOrigin) {
                let headYawLinkHeadTargetLocalPos = this.Valter.headYawLinkOriginObject3D.worldToLocal(this.headTargetObject.clone());
                let headYawLinkHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(headYawLinkHeadTargetLocalPos);
                this.headTargetDirectionFromYawLinkOriginArrowHelper = new THREE.ArrowHelper(headYawLinkHeadTargetLocalPos.normalize(), new THREE.Vector3(0.0, 0.0, 0.0), headYawLinkHeadTargetDistance, 0xff00ff, 0.01, 0.005);
                this.Valter.headYawLinkOriginObject3D.add(this.headTargetDirectionFromYawLinkOriginArrowHelper);
            }
        });
    }
    headTargetAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);
        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLab.WebGLRendererCanvas.style.cursor = 'move';
            if (event.event.ctrlKey == true) {
                let shiftY = 0.005 * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1);
                this.headTargetObject.position.y += shiftY;
            } else {
                let rect = this.vLab.WebGLRendererCanvas.getBoundingClientRect();
                let x = (currentActionInitialEventCoords.x - rect.left) / rect.width;
                let y = (currentActionInitialEventCoords.y - rect.top) / rect.height;
                var pointerVector = new THREE.Vector2();
                pointerVector.set((x * 2) - 1, -(y * 2) + 1);
                this.helperDragRaycaster.setFromCamera(pointerVector, this.vLab.SceneDispatcher.currentVLabScene.currentCamera);
                let intersections = this.helperDragRaycaster.intersectObjects([this.Valter.helperDragXZPlane], true);
                if (intersections[0]) {
                    let intersectionPoint = intersections[0].point.clone();
                    if (this.headTargetObjectPrevPosition == undefined) {
                        this.headTargetObjectPrevPosition = new THREE.Vector3().copy(this.headTargetObject.position.clone());
                        this.prevHeadTargetObjectOffest = new THREE.Vector3().copy(intersectionPoint);
                    } else {
                        intersectionPoint.sub(this.prevHeadTargetObjectOffest);
                        let dragPosition = this.headTargetObjectPrevPosition.clone();
                        intersectionPoint.multiplyScalar(0.5);
                        dragPosition.add(intersectionPoint);
                        this.headTargetObject.position.x = dragPosition.x;
                        this.headTargetObject.position.z = dragPosition.z;
                    }
                }
            }
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }

    commonInvAction() {
        this.headTargetObjectPrevPosition = undefined;
        this.vLab.WebGLRendererCanvas.style.cursor = 'default';
        this.vLab.SceneDispatcher.currentVLabScene.currentControls.enable();
    }
}
export default ValterIK;