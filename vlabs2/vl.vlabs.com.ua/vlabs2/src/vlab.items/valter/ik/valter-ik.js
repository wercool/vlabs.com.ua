import * as THREE from 'three';
import * as VLabUtils from '../../../vlab.fwk/utils/vlab.utils';
import * as ANNUtils from '../../../vlab.fwk/utils/ann.utils';
import * as tf from '@tensorflow/tfjs';

var TransformControls = require('three-transform-ctrls');

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

        /**
         * Head Yaw Link origin used because it is the base for head kinect measurements
         */
        this.headYawLinkOriginObject3D = new THREE.Object3D();
        this.headYawLinkOriginObject3D.position.copy(this.Valter.headYawLink.position.clone());
        this.Valter.torsoFrame.add(this.headYawLinkOriginObject3D);

        /**
         * Setup TF models
         */

        tf.setBackend('webgl');
        console.log('ValterIK -> TF Backend ->', tf.getBackend());

        this.valterHeadIKTFModel = undefined;

        if (this.Valter.nature.ANNIK.headANNIK) {
            tf.loadLayersModel(this.Valter.nature.ANNIK.headIKTFModelURL ? this.Valter.nature.ANNIK.headIKTFModelURL : 'localstorage://valter-head-ik-model')
            .then((model) => {
                // Warmup the model before using real data.
                const warmupResult = model.predict(tf.zeros([1, 3]));
                warmupResult.dataSync();
                warmupResult.dispose();

                this.valterHeadIKTFModel = model;
            })
            .catch(error => {
                console.error(error.message);
            });
        }

        this.valterRightPalmIKTFModel = undefined;

        if (this.Valter.nature.ANNIK.rightPalmANNIK) {
            tf.loadLayersModel(this.Valter.nature.ANNIK.rightPalmIKTFModelURL ? this.Valter.nature.ANNIK.rightPalmIKTFModelURL : 'localstorage://valter-right-palm-ik-model')
            .then((model) => {
                // Warmup the model before using real data.
                const warmupResult = model.predict(tf.zeros([1, 3]));
                warmupResult.dataSync();
                warmupResult.dispose();

                this.valterRightPalmIKTFModel = model;
            })
            .catch(error => {
                console.error(error.message);
            });
        }

        this.valterLeftPalmIKTFModel = undefined;

        if (this.Valter.nature.ANNIK.leftPalmANNIK) {
            tf.loadLayersModel(this.Valter.nature.ANNIK.leftPalmIKTFModelURL ? this.Valter.nature.ANNIK.leftPalmIKTFModelURL : 'localstorage://valter-left-palm-ik-model')
            .then((model) => {
                // Warmup the model before using real data.
                const warmupResult = model.predict(tf.zeros([1, 3]));
                warmupResult.dataSync();
                warmupResult.dispose();

                this.valterLeftPalmIKTFModel = model;
            })
            .catch(error => {
                console.error(error.message);
            });
        }

        /**
         * Head target setup
         */
        this.setupHeadTarget();
        /**
         * Right palm setup
         */
        this.setupRightPalmTarget();
        /**
         * Left palm setup
         */
        this.setupLeftPalmTarget();
    }

    setupKinectHeadToHeadTargetArrowHelper() {
        if (this.Valter.nature.devHelpers.showKinectHeadToHeadTargetArrowHelper == true) {
            this.Valter.baseFrame.updateMatrixWorld();
            let headTargetObjectGlobalPosition = this.headYawLinkOriginObject3D.localToWorld(this.headTargetObject.position.clone());
            let kinectHeadToHeadTargetLocalPos = this.Valter.kinectHead.worldToLocal(headTargetObjectGlobalPosition);
            let kinectHeadToHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(kinectHeadToHeadTargetLocalPos);

            this.kinectHeadToHeadTargetArrowHelper = new THREE.ArrowHelper(kinectHeadToHeadTargetLocalPos.clone().normalize(), new THREE.Vector3(0.0, 0.0, 0.0), kinectHeadToHeadTargetDistance, 0xff00ff, 0.02, 0.01);
            this.Valter.kinectHead.add(this.kinectHeadToHeadTargetArrowHelper);
            this.Valter.selfMeshes.push(this.kinectHeadToHeadTargetArrowHelper.cone);
        }
    }

    updateKinectHeadToHeadTargetArrowHelper() {
        if (this.Valter.nature.devHelpers.showKinectHeadToHeadTargetArrowHelper == true) {
            this.Valter.baseFrame.updateMatrixWorld();
            let headTargetObjectGlobalPosition = this.headYawLinkOriginObject3D.localToWorld(this.headTargetObject.position.clone());
            let kinectHeadToHeadTargetLocalPos = this.Valter.kinectHead.worldToLocal(headTargetObjectGlobalPosition);
            let kinectHeadToHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(kinectHeadToHeadTargetLocalPos);
            // this.kinectHeadToHeadTargetArrowHelper.setDirection(kinectHeadToHeadTargetLocalPos.clone().normalize());
            this.kinectHeadToHeadTargetArrowHelper.setLength(kinectHeadToHeadTargetDistance, 0.02, 0.01);
        }
    }

    setupHeadTargetDirectionFromHeadYawLinkOrigin(distance = 0.4) {
        if (this.Valter.kinectHeadDirection !== undefined) {
            this.headDirectionTargetDistance = distance;
            this.headDirectionTargetObject3D = new THREE.Object3D();
            this.headDirectionTargetObject3D.position.copy(this.Valter.kinectHeadDirection.clone().multiplyScalar(this.headDirectionTargetDistance));
            this.Valter.kinectHead.add(this.headDirectionTargetObject3D);

            let geometry = new THREE.SphereBufferGeometry(0.015, 8, 8);
            let material = new THREE.MeshBasicMaterial({color: 0x00ff00});
            this.headDirectionTarget = new THREE.Mesh(geometry, material);
            this.headDirectionTarget.position.copy(this.headDirectionTargetObject3D.position.clone());
            this.Valter.kinectHead.add(this.headDirectionTarget);
            this.Valter.selfMeshes.push(this.headDirectionTarget);

            this.Valter.baseFrame.updateMatrixWorld();
            this.headDirectionTargetGlobalPosition = this.Valter.kinectHead.localToWorld(this.headDirectionTargetObject3D.position.clone());
            this.headYawLinkHeadTargetLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.headDirectionTargetGlobalPosition.clone());
            let headYawLinkHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(this.headYawLinkHeadTargetLocalPos);
            this.headDirectionTargetFromHeadYawLinkArrowHelper = new THREE.ArrowHelper(this.headYawLinkHeadTargetLocalPos.clone().normalize(), new THREE.Vector3(0.0, 0.0, 0.0), headYawLinkHeadTargetDistance, 0xff00ff, 0.02, 0.01);
            this.headYawLinkOriginObject3D.add(this.headDirectionTargetFromHeadYawLinkArrowHelper);
            this.Valter.selfMeshes.push(this.headDirectionTargetFromHeadYawLinkArrowHelper.cone);

            let headYawLinkOriginObject3DAxis = new TransformControls(this.vLab.SceneDispatcher.currentVLabScene.currentCamera, this.vLab.WebGLRendererCanvas);
            headYawLinkOriginObject3DAxis.setSize(1.0);
            headYawLinkOriginObject3DAxis.setSpace('local');
            headYawLinkOriginObject3DAxis.enabled = false;
            this.vLab.SceneDispatcher.currentVLabScene.add(headYawLinkOriginObject3DAxis);
            headYawLinkOriginObject3DAxis.attach(this.headYawLinkOriginObject3D);
        }
    }

    updateHeadTargetDirectionFromHeadYawLinkOrigin() {
        if (this.Valter.nature.devHelpers.showKinectHeadDirection == true) {
            this.headDirectionTargetObject3D.position.copy(this.Valter.kinectHeadDirection.clone().multiplyScalar(this.headDirectionTargetDistance));
            this.headDirectionTarget.position.copy(this.headDirectionTargetObject3D.position.clone());

            this.Valter.kinectHeadDirectionArrowHelper.setLength(this.headDirectionTargetDistance, 0.02, 0.01);

            this.Valter.baseFrame.updateMatrixWorld();
            this.headDirectionTargetGlobalPosition = this.Valter.kinectHead.localToWorld(this.headDirectionTargetObject3D.position.clone());

            this.headYawLinkHeadTargetLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.headDirectionTargetGlobalPosition.clone());
            this.headYawLinkHeadTargetLocalPos = new THREE.Vector3(parseFloat(this.headYawLinkHeadTargetLocalPos.x.toFixed(3)), parseFloat(this.headYawLinkHeadTargetLocalPos.y.toFixed(3)), parseFloat(this.headYawLinkHeadTargetLocalPos.z.toFixed(3)));
            let headYawLinkHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(this.headYawLinkHeadTargetLocalPos);
            this.headYawLinkHeadTargetDirection = this.headYawLinkHeadTargetLocalPos.clone().normalize();
            this.headYawLinkHeadTargetDirection = new THREE.Vector3(parseFloat(this.headYawLinkHeadTargetDirection.x.toFixed(3)), parseFloat(this.headYawLinkHeadTargetDirection.y.toFixed(3)), parseFloat(this.headYawLinkHeadTargetDirection.z.toFixed(3)));
            this.headDirectionTargetFromHeadYawLinkArrowHelper.setDirection(this.headYawLinkHeadTargetDirection);
            this.headDirectionTargetFromHeadYawLinkArrowHelper.setLength(headYawLinkHeadTargetDistance, 0.02, 0.01);
        }
    }

    /**
     * 
     * 
     * Head target
     * 
     * 
     */
    setupHeadTarget() {
        this.Valter.baseFrame.updateMatrixWorld();
        var headTargetObjectGeometry = new THREE.SphereBufferGeometry(0.025, 16, 16);
        var headTargetObjectMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true, wireframeLinewidth: 0.0001, transparent: true, opacity: 0.5 });
        this.headTargetObject = new THREE.Mesh(headTargetObjectGeometry, headTargetObjectMaterial);
        this.headTargetObject.name = 'headTargetObject';
        this.headYawLinkOriginObject3D.add(this.headTargetObject);
        this.Valter.selfMeshes.push(this.headTargetObject);

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
            this.headTargetObjectInteractable.vLabSceneObject.position.copy(new THREE.Vector3(0.0, 0.0, 1.0));

            this.headTargetObjectLastSetPosition = new THREE.Vector3().copy(this.headTargetObjectInteractable.vLabSceneObject.position.clone());

            this.setupKinectHeadToHeadTargetArrowHelper();

            this.headTargetObjectInteractable.DEV.menu.unshift(
                {
                    label: 'Get Head Yaw & Tilt IK from VLabsRESTValterHeadIKService',
                    enabled: true,
                    selected: false,
                    primary: true,
                    icon: '<i class=\"material-icons\">share</i>',
                    action: () => {
                        let headTargetObjectPos = this.headTargetObject.position.clone();
                        console.log(headTargetObjectPos);
                        let headTargetPosition = {
                            x: parseFloat(headTargetObjectPos.x.toFixed(3)),
                            y: parseFloat(headTargetObjectPos.y.toFixed(3)),
                            z: parseFloat(headTargetObjectPos.z.toFixed(3))
                        };
                        console.log('getHeadFKTuple REQUEST:');
                        console.log(headTargetPosition);
                        this.vLab.VLabsRESTClientManager.ValterHeadIKService.getHeadFKTuple(headTargetPosition)
                        .then(valterHeadFKTuples => {
                            console.log('getHeadFKTuple RESULT:');
                            console.log(valterHeadFKTuples);
                            if (valterHeadFKTuples.length > 0) {

                                let minDistanceTuple = valterHeadFKTuples[0];
                                let curTupleTargetPos = new THREE.Vector3().set(
                                    minDistanceTuple.headTargetPosition.x,
                                    minDistanceTuple.headTargetPosition.y,
                                    minDistanceTuple.headTargetPosition.z
                                );
                                let minDistance = curTupleTargetPos.distanceToSquared(headTargetPosition);
                                valterHeadFKTuples.forEach((valterHeadFKTuple) => {
                                    curTupleTargetPos =  new THREE.Vector3().set(
                                        valterHeadFKTuple.headTargetPosition.x,
                                        valterHeadFKTuple.headTargetPosition.y,
                                        valterHeadFKTuple.headTargetPosition.z
                                    );
                                    let distance = curTupleTargetPos.distanceToSquared(headTargetPosition);
                                    if (distance < minDistance) {
                                        minDistance = distance;
                                        minDistanceTuple = valterHeadFKTuple;
                                    }
                                });

                                console.log('getHeadFKTuple SELECTED:');
                                console.log(minDistanceTuple);

                                this.Valter.setHeadYawLink(minDistanceTuple.headYawLinkValue);
                                this.Valter.setHeadTiltLink(minDistanceTuple.headTiltLinkValue);
                            }
                        });
                    }
                }
            );

            this.headTargetObjectInteractable.DEV.menu.unshift(
                {
                    label: 'Get ALL Head Yaw & Tilt FK points from VLabsRESTValterHeadIKService',
                    enabled: true,
                    selected: false,
                    primary: true,
                    icon: '<i class=\"material-icons\">grain</i>',
                    action: () => {
                        let headFKPointsMaterial = new THREE.PointsMaterial({ size: 0.01, color: 0xff00ff });
                        let headFKPointsGeometry = new THREE.Geometry();
                        this.vLab.VLabsRESTClientManager.ValterHeadIKService.getAllHeadFKTuples()
                        .then(valterHeadFKTuples => {
                            valterHeadFKTuples.forEach(valterHeadFKTuple => {
                                let point = new THREE.Vector3().set(valterHeadFKTuple.headTargetPosition.x, valterHeadFKTuple.headTargetPosition.y, valterHeadFKTuple.headTargetPosition.z);
                                headFKPointsGeometry.vertices.push(point);
                            });
                            this.headFKPoints = new THREE.Points(headFKPointsGeometry, headFKPointsMaterial);
                            this.headYawLinkOriginObject3D.add(this.headFKPoints);
                        });
                    }
                }
            );

            if (this.Valter.nature.devHelpers.showHeadTargetDirectionFromHeadYawLinkOrigin) {
                let headYawLinkHeadTargetLocalPos = this.headTargetObject.position.clone();
                let headYawLinkHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(headYawLinkHeadTargetLocalPos);
                this.headTargetDirectionFromYawLinkOriginArrowHelper = new THREE.ArrowHelper(headYawLinkHeadTargetLocalPos.normalize(), new THREE.Vector3(0.0, 0.0, 0.0), headYawLinkHeadTargetDistance, 0xff00ff, 0.02, 0.01);
                this.headYawLinkOriginObject3D.add(this.headTargetDirectionFromYawLinkOriginArrowHelper);
                this.Valter.selfMeshes.push(this.headTargetDirectionFromYawLinkOriginArrowHelper.cone);
            }
        });
    }

    resetHeadTarget() {
        this.Valter.baseFrame.updateMatrixWorld();
        this.headTargetObjectInteractable.vLabSceneObject.position.copy(new THREE.Vector3(0.0, 0.0, 1.0));
        if (this.Valter.nature.devHelpers.showHeadTargetDirectionFromHeadYawLinkOrigin) {
            let headYawLinkHeadTargetLocalPos = this.headTargetObjectInteractable.vLabSceneObject.position.clone();

            let headYawLinkHeadTargetDir = headYawLinkHeadTargetLocalPos.clone().normalize();
            let headYawLinkHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(headYawLinkHeadTargetLocalPos);
            this.headTargetDirectionFromYawLinkOriginArrowHelper.setDirection(headYawLinkHeadTargetDir);
            this.headTargetDirectionFromYawLinkOriginArrowHelper.setLength(headYawLinkHeadTargetDistance, 0.02, 0.01);
        }
    }

    headTargetAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);
        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLab.WebGLRendererCanvas.style.cursor = 'move';

            if (this.headTargetObjectPrevGlobalPosition != undefined) {
                var newHeadTargetObjectPos = this.headTargetObject.position.clone();
            }

            if (event.event.ctrlKey == true) {
                let headTargetObjectGlobalPosition = this.headYawLinkOriginObject3D.localToWorld(this.headTargetObject.position.clone());
                let distanceToCurrentCamera = headTargetObjectGlobalPosition.distanceTo(this.vLab.SceneDispatcher.currentVLabScene.currentCamera.position);
                let shiftY = distanceToCurrentCamera * 0.002 * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1);
                var newHeadTargetObjectPos = this.headTargetObject.position.clone();
                newHeadTargetObjectPos.y += shiftY;
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
                    if (this.headTargetObjectPrevGlobalPosition == undefined) {
                        this.headTargetObjectPrevGlobalPosition = this.headYawLinkOriginObject3D.localToWorld(this.headTargetObject.position.clone());
                        this.prevHeadTargetObjectOffest = intersectionPoint;
                        return;
                    } else {
                            intersectionPoint.sub(this.prevHeadTargetObjectOffest);
                            let dragPosition = this.headTargetObjectPrevGlobalPosition.clone();
                            intersectionPoint.multiplyScalar(0.5);
                            dragPosition.add(intersectionPoint);



                            let localDragPos = this.headYawLinkOriginObject3D.worldToLocal(dragPosition.clone());
                            newHeadTargetObjectPos.x = localDragPos.x;
                            newHeadTargetObjectPos.z = localDragPos.z;
                    }
                }
            }

            if (newHeadTargetObjectPos != undefined) {

                let headNormalizationBounds = this.Valter.nature.ANNIK.headFKTuplesNormalizationBounds;

                let headYawLinkHeadTargetLocalPos = newHeadTargetObjectPos.clone();

                if (headYawLinkHeadTargetLocalPos.y > 0.0 
                 || headYawLinkHeadTargetLocalPos.y < headNormalizationBounds.headTargetPositionYMin * 0.95 
                 || headYawLinkHeadTargetLocalPos.z > headNormalizationBounds.headTargetPositionZMax * 0.95 
                 || headYawLinkHeadTargetLocalPos.z < headNormalizationBounds.headTargetPositionZMin * 0.95 
                ) {
                    newHeadTargetObjectPos = this.headYawLinkOriginObject3D.worldToLocal(this.headTargetObjectLastSetPosition.clone());
                    this.headTargetObjectPrevGlobalPosition = undefined;
                    this.vLab.WebGLRendererCanvas.style.cursor = 'default';
                    newHeadTargetObjectPos.copy(this.headTargetObjectLastSetPosition);
                } else {
                    this.headTargetObjectLastSetPosition = new THREE.Vector3().copy(newHeadTargetObjectPos.clone());

                    this.headTargetObject.position.copy(newHeadTargetObjectPos);
        
                    if (this.Valter.nature.devHelpers.showHeadTargetDirectionFromHeadYawLinkOrigin) {
                        let headYawLinkHeadTargetDir = headYawLinkHeadTargetLocalPos.clone().normalize();
                        let headYawLinkHeadTargetDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(newHeadTargetObjectPos);
                        this.headTargetDirectionFromYawLinkOriginArrowHelper.setDirection(headYawLinkHeadTargetDir);
                        this.headTargetDirectionFromYawLinkOriginArrowHelper.setLength(headYawLinkHeadTargetDistance, 0.02, 0.01);
                    }
    
                    if (this.Valter.nature.ANNIK.headANNIK && this.valterHeadIKTFModel !== undefined) {
                        /**
                         *
                         *
                         _    _                _   _____ _  __ 
                        | |  | |              | | |_   _| |/ /
                        | |__| | ___  __ _  __| |   | | | ' /
                        |  __  |/ _ \/ _` |/ _` |   | | |  <
                        | |  | |  __/ (_| | (_| |  _| |_| . \
                        |_|  |_|\___|\__,_|\__,_| |_____|_|\_\
                        _____              _ _      _   _ 
                        |  __ \            | (_)    | | (_)
                        | |__) | __ ___  __| |_  ___| |_ _  ___  _ __  
                        |  ___/ '__/ _ \/ _` | |/ __| __| |/ _ \| '_ \ 
                        | |   | | |  __/ (_| | | (__| |_| | (_) | | | |
                        |_|   |_|  \___|\__,_|_|\___|\__|_|\___/|_| |_|
                        *
                        *
                        */
                        let nHeadTargetX = ANNUtils.normalizeNegPos(this.headTargetObject.position.x, headNormalizationBounds.headTargetPositionXMin, headNormalizationBounds.headTargetPositionXMax);
                        let nHeadTargetY = ANNUtils.normalizeNegPos(this.headTargetObject.position.y, headNormalizationBounds.headTargetPositionYMin, headNormalizationBounds.headTargetPositionYMax);
                        let nHeadTargetZ = ANNUtils.normalizeNegPos(this.headTargetObject.position.z, headNormalizationBounds.headTargetPositionZMin, headNormalizationBounds.headTargetPositionZMax);
    
                        const valterHeadYawTiltPreditction = this.valterHeadIKTFModel.predict(tf.tensor([nHeadTargetX, nHeadTargetY, nHeadTargetZ], [1, 3]));
                        const valterHeadYawTiltPreditctionData = valterHeadYawTiltPreditction.dataSync();
                        const valterHeadYawPreditctionValue = ANNUtils.deNormalizeNegPos(valterHeadYawTiltPreditctionData[0], headNormalizationBounds.headYawLinkValueMin, headNormalizationBounds.headYawLinkValueMax);
                        const valterHeadTiltPreditctionValue = ANNUtils.deNormalizeNegPos(valterHeadYawTiltPreditctionData[1], headNormalizationBounds.headTiltLinkValueMin, headNormalizationBounds.headTiltLinkValueMax);
    
                        // console.log('[' + this.headTargetObject.position.x.toFixed(3) + ', ' + this.headTargetObject.position.y.toFixed(3) + ', ' + this.headTargetObject.position.z.toFixed(3) + '] -> [' + valterHeadYawPreditctionValue.toFixed(3) +', ' + valterHeadTiltPreditctionValue.toFixed(3) + ']');
    
                        this.Valter.setHeadYawLink(valterHeadYawPreditctionValue);
                        this.Valter.setHeadTiltLink(valterHeadTiltPreditctionValue);
                    }

                    this.updateKinectHeadToHeadTargetArrowHelper();
                }
            }
        }

        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }

    /**
     * 
     * 
     * Right palm target
     * 
     * 
     */
    setupRightPalmTarget() {
        this.Valter.baseFrame.updateMatrixWorld();
        var rightPalmTargetObjectGeometry = new THREE.SphereBufferGeometry(0.025, 16, 16);
        var rightPalmTargetObjectMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, wireframeLinewidth: 0.0001, transparent: true, opacity: 0.5 });
        this.rightPalmTargetObject = new THREE.Mesh(rightPalmTargetObjectGeometry, rightPalmTargetObjectMaterial);
        this.rightPalmTargetObject.name = 'rightPalmTargetObject';
        this.headYawLinkOriginObject3D.add(this.rightPalmTargetObject);
        this.Valter.selfMeshes.push(this.rightPalmTargetObject);

        this.vLab.SceneDispatcher.currentVLabScene.addInteractable({
            name: 'rightPalmTargetObject',
            intersectable: true,
            preselectable: true,
            action: {
                context: this,
                function: this.rightPalmTargetAction,
                manipulator: true,
                activated: true,
                invfunction: this.commonInvAction,
                args: {}
            },
        }).then((rightPalmTargetObjectInteractable) => {
            this.rightPalmTargetObjectInteractable = rightPalmTargetObjectInteractable;

            this.rightPalmTargetGlobalPosition = this.Valter.rightPalm.localToWorld(new THREE.Vector3());
            this.headYawLinkRightPalmTargetLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.rightPalmTargetGlobalPosition.clone());

            this.rightPalmTargetObjectInteractable.vLabSceneObject.position.copy(this.headYawLinkRightPalmTargetLocalPos);

            this.rightPalmTargetObjectLastSetPosition = new THREE.Vector3().copy(this.rightPalmTargetObjectInteractable.vLabSceneObject.position.clone());

            if (this.Valter.nature.devHelpers.showRightPalmTargetDirectionFromHeadYawLinkOrigin == true) {
                this.setupRightPalmTargetDirectionFromHeadYawLinkOriginArrowHelper();
            }

            this.rightPalmTargetObjectInteractable.DEV.menu.unshift(
                {
                    label: 'Get Right Palm IK from ValterRightPalmIKService',
                    enabled: true,
                    selected: false,
                    primary: true,
                    icon: '<i class=\"material-icons\">share</i>',
                    action: () => {
                        let rightPalmTargetObjectPos = this.rightPalmTargetObject.position.clone();
                        // console.log(rightPalmTargetObjectPos);
                        let rightPalmTargetPosition = {
                            x: parseFloat(rightPalmTargetObjectPos.x.toFixed(3)),
                            y: parseFloat(rightPalmTargetObjectPos.y.toFixed(3)),
                            z: parseFloat(rightPalmTargetObjectPos.z.toFixed(3))
                        };
                        console.log('getRightPalmFKTuple REQUEST:');
                        console.log(rightPalmTargetPosition);
                        this.vLab.VLabsRESTClientManager.ValterRightPalmIKService.getRightPalmFKTuple(rightPalmTargetPosition)
                        .then(valterRightPalmFKTuples => {
                            console.log('getRightPalmFKTuple RESULT:');
                            console.log(valterRightPalmFKTuples);
                            if (valterRightPalmFKTuples.length > 0) {

                                let minDistanceTuple = valterRightPalmFKTuples[0];
                                let curTupleTargetPos = new THREE.Vector3().set(
                                    minDistanceTuple.rightPalmTargetPosition.x,
                                    minDistanceTuple.rightPalmTargetPosition.y,
                                    minDistanceTuple.rightPalmTargetPosition.z
                                );
                                let minDistance = curTupleTargetPos.distanceToSquared(rightPalmTargetPosition);
                                valterRightPalmFKTuples.forEach((valterRightPalmFKTuple) => {
                                    curTupleTargetPos =  new THREE.Vector3().set(
                                        valterRightPalmFKTuple.rightPalmTargetPosition.x,
                                        valterRightPalmFKTuple.rightPalmTargetPosition.y,
                                        valterRightPalmFKTuple.rightPalmTargetPosition.z
                                    );
                                    let distance = curTupleTargetPos.distanceToSquared(rightPalmTargetPosition);
                                    if (distance < minDistance) {
                                        minDistance = distance;
                                        minDistanceTuple = valterRightPalmFKTuple;
                                    }
                                });

                                console.log('getRightPalmFKTuple SELECTED:');
                                console.log(minDistanceTuple);

                                this.Valter.setShoulderRightLink(minDistanceTuple.shoulderRightLinkValue);
                                this.Valter.setLimbRightLink(minDistanceTuple.limbRightLinkValue);
                                this.Valter.setArmRightLink(minDistanceTuple.armRightLinkValue);
                                this.Valter.setForearmRollRightLink(minDistanceTuple.forearmRollRightLinkValue);
                            }
                        });
                    }
                }
            );

            this.rightPalmTargetObjectInteractable.DEV.menu.unshift(
                {
                    label: 'Get ALL Right Palm FK points from ValterRightPalmIKService',
                    enabled: true,
                    selected: false,
                    primary: true,
                    icon: '<i class=\"material-icons\">grain</i>',
                    action: () => {
                        let rightPalmFKPointsMaterial = new THREE.PointsMaterial({ size: 0.01, color: 0x00ff00 });
                        let rightPalmFKPointsGeometry = new THREE.Geometry();
                        this.vLab.VLabsRESTClientManager.ValterRightPalmIKService.getAllRightPalmFKTuples(this.rightPalmIKDataThrottlingSigma)
                        .then(valterRightPalmFKTuples => {
                            console.log('valterRightPalmFKTuples size: ' + valterRightPalmFKTuples.length);
                            valterRightPalmFKTuples.forEach(valterRightPalmFKTuple => {
                                let point = new THREE.Vector3().set(valterRightPalmFKTuple.rightPalmTargetPosition.x, valterRightPalmFKTuple.rightPalmTargetPosition.y, valterRightPalmFKTuple.rightPalmTargetPosition.z);
                                rightPalmFKPointsGeometry.vertices.push(point);
                            });
                            this.rightPalmFKPoints = new THREE.Points(rightPalmFKPointsGeometry, rightPalmFKPointsMaterial);
                            this.headYawLinkOriginObject3D.add(this.rightPalmFKPoints);
                        });
                    }
                }
            );
        });
    }

    resetRightPalmTarget() {
        this.Valter.baseFrame.updateMatrixWorld();
        this.rightPalmTargetGlobalPosition = this.Valter.rightPalm.localToWorld(new THREE.Vector3());
        this.headYawLinkRightPalmTargetLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.rightPalmTargetGlobalPosition.clone());
        this.rightPalmTargetObjectInteractable.vLabSceneObject.position.copy(this.headYawLinkRightPalmTargetLocalPos);
        this.updateRightPalmTargetDirectionFromHeadYawLinkOriginArrowHelper();
        this.updateRightPalmDirectionFromHeadYawLinkOriginArrowHelper();
    }

    rightPalmTargetAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);
        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLab.WebGLRendererCanvas.style.cursor = 'move';

            if (this.rightPalmTargetObjectPrevGlobalPosition != undefined) {
                var newRightPalmTargetObjectPos = this.rightPalmTargetObject.position.clone();
            }

            if (event.event.ctrlKey == true) {
                let rightPalmTargetObjectGlobalPosition = this.headYawLinkOriginObject3D.localToWorld(this.rightPalmTargetObject.position.clone());
                let distanceToCurrentCamera = rightPalmTargetObjectGlobalPosition.distanceTo(this.vLab.SceneDispatcher.currentVLabScene.currentCamera.position);
                let shiftY = distanceToCurrentCamera * 0.002 * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1);
                var newRightPalmTargetObjectPos = this.rightPalmTargetObject.position.clone();
                newRightPalmTargetObjectPos.y += shiftY;
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
                    if (this.rightPalmTargetObjectPrevGlobalPosition == undefined) {
                        this.rightPalmTargetObjectPrevGlobalPosition = this.headYawLinkOriginObject3D.localToWorld(this.rightPalmTargetObject.position.clone());
                        this.prevRightPalmTargetObjectOffest = intersectionPoint;
                        return;
                    } else {
                            intersectionPoint.sub(this.prevRightPalmTargetObjectOffest);
                            let dragPosition = this.rightPalmTargetObjectPrevGlobalPosition.clone();
                            intersectionPoint.multiplyScalar(0.5);
                            dragPosition.add(intersectionPoint);


                            let localDragPos = this.headYawLinkOriginObject3D.worldToLocal(dragPosition.clone());
                            newRightPalmTargetObjectPos.x = localDragPos.x;
                            newRightPalmTargetObjectPos.z = localDragPos.z;
                    }
                }
            }

            if (newRightPalmTargetObjectPos != undefined) {

                let rightPalmFKTuplesNormalizationBounds = this.Valter.nature.ANNIK.rightPalmFKTuplesNormalizationBounds;

                let headYawLinkRightPalmTargetLocalPos = newRightPalmTargetObjectPos.clone();

                /**
                 * Check bounds
                 */
                if (headYawLinkRightPalmTargetLocalPos.x > rightPalmFKTuplesNormalizationBounds.rightPalmTargetPositionXMax * 0.95 
                 || headYawLinkRightPalmTargetLocalPos.x < rightPalmFKTuplesNormalizationBounds.rightPalmTargetPositionXMin * 0.95 
                 || headYawLinkRightPalmTargetLocalPos.y > rightPalmFKTuplesNormalizationBounds.rightPalmTargetPositionYMax * 0.95 
                 || headYawLinkRightPalmTargetLocalPos.y < rightPalmFKTuplesNormalizationBounds.rightPalmTargetPositionYMin * 0.95 
                 || headYawLinkRightPalmTargetLocalPos.z > rightPalmFKTuplesNormalizationBounds.rightPalmTargetPositionZMax * 0.95 
                 || headYawLinkRightPalmTargetLocalPos.z < rightPalmFKTuplesNormalizationBounds.rightPalmTargetPositionZMin * 0.95 
                ) {
                    newRightPalmTargetObjectPos = this.headYawLinkOriginObject3D.worldToLocal(this.rightPalmTargetObjectLastSetPosition.clone());
                    this.rightPalmTargetObjectPrevGlobalPosition = undefined;
                    this.vLab.WebGLRendererCanvas.style.cursor = 'default';
                    newRightPalmTargetObjectPos.copy(this.rightPalmTargetObjectLastSetPosition);
                } else {
                    this.rightPalmTargetObjectLastSetPosition = new THREE.Vector3().copy(newRightPalmTargetObjectPos.clone());

                    this.rightPalmTargetObject.position.copy(newRightPalmTargetObjectPos);
    
                    this.updateRightPalmTargetDirectionFromHeadYawLinkOriginArrowHelper();

                    if (this.Valter.nature.ANNIK.rightPalmANNIK && this.valterRightPalmIKTFModel !== undefined) {
                        /**
                         *
                         *
                             _____  _       _     _     _____      _             _____ _  __
                            |  __ \(_)     | |   | |   |  __ \    | |           |_   _| |/ /
                            | |__) |_  __ _| |__ | |_  | |__) |_ _| |_ __ ___     | | | ' / 
                            |  _  /| |/ _` | '_ \| __| |  ___/ _` | | '_ ` _ \    | | |  <  
                            | | \ \| | (_| | | | | |_  | |  | (_| | | | | | | |  _| |_| . \ 
                            |_|__\_\_|\__, |_| |_|\__| |_|   \__,_|_|_| |_| |_| |_____|_|\_\
                            |  __ \    __/ |   | (_)    | | (_)
                            | |__) | _|___/  __| |_  ___| |_ _  ___  _ __ 
                            |  ___/ '__/ _ \/ _` | |/ __| __| |/ _ \| '_ \ 
                            | |   | | |  __/ (_| | | (__| |_| | (_) | | | |
                            |_|   |_|  \___|\__,_|_|\___|\__|_|\___/|_| |_|
                        *
                        *
                        */
                        let nRightPalmTargetX = ANNUtils.normalizeNegPos(this.rightPalmTargetObject.position.x, rightPalmFKTuplesNormalizationBounds.rightPalmTargetPositionXMin, rightPalmFKTuplesNormalizationBounds.rightPalmTargetPositionXMax);
                        let nRightPalmTargetY = ANNUtils.normalizeNegPos(this.rightPalmTargetObject.position.y, rightPalmFKTuplesNormalizationBounds.rightPalmTargetPositionYMin, rightPalmFKTuplesNormalizationBounds.rightPalmTargetPositionYMax);
                        let nRightPalmTargetZ = ANNUtils.normalizeNegPos(this.rightPalmTargetObject.position.z, rightPalmFKTuplesNormalizationBounds.rightPalmTargetPositionZMin, rightPalmFKTuplesNormalizationBounds.rightPalmTargetPositionZMax);

                        const valterRightPalmIKreditction = this.valterRightPalmIKTFModel.predict(tf.tensor([nRightPalmTargetX, nRightPalmTargetY, nRightPalmTargetZ], [1, 3]));
                        const valterRightPalmIKreditctionData = valterRightPalmIKreditction.dataSync();

                        const shoulderRightLinkValuePrediction = ANNUtils.deNormalizeNegPos(valterRightPalmIKreditctionData[0], rightPalmFKTuplesNormalizationBounds.shoulderRightLinkValueMin, rightPalmFKTuplesNormalizationBounds.shoulderRightLinkValueMax);
                        const limbRightLinkValuePrediction = ANNUtils.deNormalizeNegPos(valterRightPalmIKreditctionData[1], rightPalmFKTuplesNormalizationBounds.limbRightLinkValueMin, rightPalmFKTuplesNormalizationBounds.limbRightLinkValueMax);
                        const armRightLinkValuePrediction = ANNUtils.deNormalizeNegPos(valterRightPalmIKreditctionData[2], rightPalmFKTuplesNormalizationBounds.armRightLinkValueMin, rightPalmFKTuplesNormalizationBounds.armRightLinkValueMax);
                        const forearmRollRightLinkValuePrediction = ANNUtils.deNormalizeNegPos(valterRightPalmIKreditctionData[3], rightPalmFKTuplesNormalizationBounds.forearmRollRightLinkValueMin, rightPalmFKTuplesNormalizationBounds.forearmRollRightLinkValueMax);

                        this.Valter.setShoulderRightLink(shoulderRightLinkValuePrediction);
                        this.Valter.setLimbRightLink(limbRightLinkValuePrediction);
                        this.Valter.setArmRightLink(armRightLinkValuePrediction);
                        this.Valter.setForearmRollRightLink(forearmRollRightLinkValuePrediction);
                    }
                }
            }
        }
        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }

    setupRightPalmTargetDirectionFromHeadYawLinkOriginArrowHelper() {
        this.Valter.baseFrame.updateMatrixWorld();
        let headYawLinkRightPalmDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(this.headYawLinkRightPalmTargetLocalPos);
        this.rightPalmFromHeadYawLinkArrowHelper = new THREE.ArrowHelper(this.headYawLinkRightPalmTargetLocalPos.clone().normalize(), new THREE.Vector3(0.0, 0.0, 0.0), headYawLinkRightPalmDistance, 0x00ff00, 0.02, 0.01);
        this.headYawLinkOriginObject3D.add(this.rightPalmFromHeadYawLinkArrowHelper);
        this.Valter.selfMeshes.push(this.rightPalmFromHeadYawLinkArrowHelper.cone);
    }

    updateRightPalmTargetDirectionFromHeadYawLinkOriginArrowHelper() {
        this.Valter.baseFrame.updateMatrixWorld();

        this.headYawLinkRightPalmTargetLocalPos = this.rightPalmTargetObject.position.clone();
        this.headYawLinkRightPalmTargetLocalPos = new THREE.Vector3(parseFloat(this.headYawLinkRightPalmTargetLocalPos.x.toFixed(3)), parseFloat(this.headYawLinkRightPalmTargetLocalPos.y.toFixed(3)), parseFloat(this.headYawLinkRightPalmTargetLocalPos.z.toFixed(3)));
        let headYawLinkRightPalmTargetObjectDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(this.headYawLinkRightPalmTargetLocalPos);
        let headYawLinkRightPalmTargetObjectDirection = this.headYawLinkRightPalmTargetLocalPos.clone().normalize();

        if (this.Valter.nature.devHelpers.showRightPalmTargetDirectionFromHeadYawLinkOrigin == true && this.rightPalmFromHeadYawLinkArrowHelper) {
            this.rightPalmFromHeadYawLinkArrowHelper.setDirection(headYawLinkRightPalmTargetObjectDirection);
            this.rightPalmFromHeadYawLinkArrowHelper.setLength(headYawLinkRightPalmTargetObjectDistance, 0.02, 0.01);
        }
    }

    updateRightPalmDirectionFromHeadYawLinkOriginArrowHelper() {
        this.Valter.baseFrame.updateMatrixWorld();

        this.rightPalmTargetGlobalPosition = this.Valter.rightPalm.localToWorld(new THREE.Vector3());

        this.headYawLinkRightPalmLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.rightPalmTargetGlobalPosition.clone());
        this.headYawLinkRightPalmLocalPos = new THREE.Vector3(
                                                                parseFloat(this.headYawLinkRightPalmLocalPos.x.toFixed(3)), 
                                                                parseFloat(this.headYawLinkRightPalmLocalPos.y.toFixed(3)), 
                                                                parseFloat(this.headYawLinkRightPalmLocalPos.z.toFixed(3)));
        let headYawLinkRightPalmtDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(this.headYawLinkRightPalmLocalPos);
        let headYawLinkRightPalmDirection = this.headYawLinkRightPalmLocalPos.clone().normalize();

        if (this.rightPalmFromHeadYawLinkArrowHelper) {
            this.rightPalmFromHeadYawLinkArrowHelper.setDirection(headYawLinkRightPalmDirection);
            this.rightPalmFromHeadYawLinkArrowHelper.setLength(headYawLinkRightPalmtDistance, 0.02, 0.01);
        }
    }

    /**
     * 
     * 
     * Left palm target
     * 
     * 
     */
    setupLeftPalmTarget() {
        this.Valter.baseFrame.updateMatrixWorld();
        var leftPalmTargetObjectGeometry = new THREE.SphereBufferGeometry(0.025, 16, 16);
        var leftPalmTargetObjectMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true, wireframeLinewidth: 0.0001, transparent: true, opacity: 0.5 });
        this.leftPalmTargetObject = new THREE.Mesh(leftPalmTargetObjectGeometry, leftPalmTargetObjectMaterial);
        this.leftPalmTargetObject.name = 'leftPalmTargetObject';
        this.headYawLinkOriginObject3D.add(this.leftPalmTargetObject);
        this.Valter.selfMeshes.push(this.leftPalmTargetObject);

        this.vLab.SceneDispatcher.currentVLabScene.addInteractable({
            name: 'leftPalmTargetObject',
            intersectable: true,
            preselectable: true,
            action: {
                context: this,
                function: this.leftPalmTargetAction,
                manipulator: true,
                activated: true,
                invfunction: this.commonInvAction,
                args: {}
            },
        }).then((leftPalmTargetObjectInteractable) => {
            this.leftPalmTargetObjectInteractable = leftPalmTargetObjectInteractable;

            this.leftPalmTargetGlobalPosition = this.Valter.leftPalm.localToWorld(new THREE.Vector3());
            this.headYawLinkLeftPalmTargetLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.leftPalmTargetGlobalPosition.clone());

            this.leftPalmTargetObjectInteractable.vLabSceneObject.position.copy(this.headYawLinkLeftPalmTargetLocalPos);

            this.leftPalmTargetObjectLastSetPosition = new THREE.Vector3().copy(this.leftPalmTargetObjectInteractable.vLabSceneObject.position.clone());

            if (this.Valter.nature.devHelpers.showLeftPalmTargetDirectionFromHeadYawLinkOrigin == true) {
                this.setupLeftPalmTargetDirectionFromHeadYawLinkOriginArrowHelper();
            }

            this.leftPalmTargetObjectInteractable.DEV.menu.unshift(
                {
                    label: 'Get Left Palm IK from ValterLeftPalmIKService',
                    enabled: true,
                    selected: false,
                    primary: true,
                    icon: '<i class=\"material-icons\">share</i>',
                    action: () => {
                        let leftPalmTargetObjectPos = this.leftPalmTargetObject.position.clone();
                        // console.log(leftPalmTargetObjectPos);
                        let leftPalmTargetPosition = {
                            x: parseFloat(leftPalmTargetObjectPos.x.toFixed(3)),
                            y: parseFloat(leftPalmTargetObjectPos.y.toFixed(3)),
                            z: parseFloat(leftPalmTargetObjectPos.z.toFixed(3))
                        };
                        console.log('getLeftPalmFKTuple REQUEST:');
                        console.log(leftPalmTargetPosition);
                        this.vLab.VLabsRESTClientManager.ValterLeftPalmIKService.getLeftPalmFKTuple(leftPalmTargetPosition)
                        .then(valterLeftPalmFKTuples => {
                            console.log('getLeftPalmFKTuple RESULT:');
                            console.log(valterLeftPalmFKTuples);
                            if (valterLeftPalmFKTuples.length > 0) {

                                let minDistanceTuple = valterLeftPalmFKTuples[0];
                                let curTupleTargetPos = new THREE.Vector3().set(
                                    minDistanceTuple.leftPalmTargetPosition.x,
                                    minDistanceTuple.leftPalmTargetPosition.y,
                                    minDistanceTuple.leftPalmTargetPosition.z
                                );
                                let minDistance = curTupleTargetPos.distanceToSquared(leftPalmTargetPosition);
                                valterLeftPalmFKTuples.forEach((valterLeftPalmFKTuple) => {
                                    curTupleTargetPos =  new THREE.Vector3().set(
                                        valterLeftPalmFKTuple.leftPalmTargetPosition.x,
                                        valterLeftPalmFKTuple.leftPalmTargetPosition.y,
                                        valterLeftPalmFKTuple.leftPalmTargetPosition.z
                                    );
                                    let distance = curTupleTargetPos.distanceToSquared(leftPalmTargetPosition);
                                    if (distance < minDistance) {
                                        minDistance = distance;
                                        minDistanceTuple = valterLeftPalmFKTuple;
                                    }
                                });

                                console.log('getLeftPalmFKTuple SELECTED:');
                                console.log(minDistanceTuple);

                                this.Valter.setShoulderLeftLink(minDistanceTuple.shoulderLeftLinkValue);
                                this.Valter.setLimbLeftLink(minDistanceTuple.limbLeftLinkValue);
                                this.Valter.setArmLeftLink(minDistanceTuple.armLeftLinkValue);
                                this.Valter.setForearmRollLeftLink(minDistanceTuple.forearmRollLeftLinkValue);
                            }
                        });
                    }
                }
            );

            this.leftPalmTargetObjectInteractable.DEV.menu.unshift(
                {
                    label: 'Get ALL Left Palm FK points from ValterLeftPalmIKService',
                    enabled: true,
                    selected: false,
                    primary: true,
                    icon: '<i class=\"material-icons\">grain</i>',
                    action: () => {
                        let leftPalmFKPointsMaterial = new THREE.PointsMaterial({ size: 0.01, color: 0xffff00 });
                        let leftPalmFKPointsGeometry = new THREE.Geometry();
                        this.vLab.VLabsRESTClientManager.ValterLeftPalmIKService.getAllLeftPalmFKTuples(this.leftPalmIKDataThrottlingSigma)
                        .then(valterLeftPalmFKTuples => {
                            console.log('valterLeftPalmFKTuples size: ' + valterLeftPalmFKTuples.length);
                            valterLeftPalmFKTuples.forEach(valterLeftPalmFKTuple => {
                                let point = new THREE.Vector3().set(valterLeftPalmFKTuple.leftPalmTargetPosition.x, valterLeftPalmFKTuple.leftPalmTargetPosition.y, valterLeftPalmFKTuple.leftPalmTargetPosition.z);
                                leftPalmFKPointsGeometry.vertices.push(point);
                            });
                            this.leftPalmFKPoints = new THREE.Points(leftPalmFKPointsGeometry, leftPalmFKPointsMaterial);
                            this.headYawLinkOriginObject3D.add(this.leftPalmFKPoints);
                        });
                    }
                }
            );
        });
    }

    resetLeftPalmTarget() {
        this.Valter.baseFrame.updateMatrixWorld();
        this.leftPalmTargetGlobalPosition = this.Valter.leftPalm.localToWorld(new THREE.Vector3());
        this.headYawLinkLeftPalmTargetLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.leftPalmTargetGlobalPosition.clone());
        this.leftPalmTargetObjectInteractable.vLabSceneObject.position.copy(this.headYawLinkLeftPalmTargetLocalPos);
        this.updateLeftPalmTargetDirectionFromHeadYawLinkOriginArrowHelper();
        this.updateLeftPalmDirectionFromHeadYawLinkOriginArrowHelper();
    }

    leftPalmTargetAction(event) {
        let currentActionInitialEventCoords = VLabUtils.getEventCoords(event.event);
        if (this.prevActionInitialEventCoords !== undefined) {
            this.vLab.SceneDispatcher.currentVLabScene.currentControls.disable();
            this.vLab.WebGLRendererCanvas.style.cursor = 'move';

            if (this.leftPalmTargetObjectPrevGlobalPosition != undefined) {
                var newLeftPalmTargetObjectPos = this.leftPalmTargetObject.position.clone();
            }

            if (event.event.ctrlKey == true) {
                let leftPalmTargetObjectGlobalPosition = this.headYawLinkOriginObject3D.localToWorld(this.leftPalmTargetObject.position.clone());
                let distanceToCurrentCamera = leftPalmTargetObjectGlobalPosition.distanceTo(this.vLab.SceneDispatcher.currentVLabScene.currentCamera.position);
                let shiftY = distanceToCurrentCamera * 0.002 * ((this.prevActionInitialEventCoords.y - currentActionInitialEventCoords.y > 0.0) ? 1 : -1);
                var newLeftPalmTargetObjectPos = this.leftPalmTargetObject.position.clone();
                newLeftPalmTargetObjectPos.y += shiftY;
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
                    if (this.leftPalmTargetObjectPrevGlobalPosition == undefined) {
                        this.leftPalmTargetObjectPrevGlobalPosition = this.headYawLinkOriginObject3D.localToWorld(this.leftPalmTargetObject.position.clone());
                        this.prevLeftPalmTargetObjectOffest = intersectionPoint;
                        return;
                    } else {
                            intersectionPoint.sub(this.prevLeftPalmTargetObjectOffest);
                            let dragPosition = this.leftPalmTargetObjectPrevGlobalPosition.clone();
                            intersectionPoint.multiplyScalar(0.5);
                            dragPosition.add(intersectionPoint);


                            let localDragPos = this.headYawLinkOriginObject3D.worldToLocal(dragPosition.clone());
                            newLeftPalmTargetObjectPos.x = localDragPos.x;
                            newLeftPalmTargetObjectPos.z = localDragPos.z;
                    }
                }
            }

            if (newLeftPalmTargetObjectPos != undefined) {

                let leftPalmFKTuplesNormalizationBounds = this.Valter.nature.ANNIK.leftPalmFKTuplesNormalizationBounds;

                let headYawLinkLeftPalmTargetLocalPos = newLeftPalmTargetObjectPos.clone();

                /**
                 * Check bounds
                 */
                if (headYawLinkLeftPalmTargetLocalPos.x > leftPalmFKTuplesNormalizationBounds.leftPalmTargetPositionXMax * 0.95 
                 || headYawLinkLeftPalmTargetLocalPos.x < leftPalmFKTuplesNormalizationBounds.leftPalmTargetPositionXMin * 0.95 
                 || headYawLinkLeftPalmTargetLocalPos.y > leftPalmFKTuplesNormalizationBounds.leftPalmTargetPositionYMax * 0.95 
                 || headYawLinkLeftPalmTargetLocalPos.y < leftPalmFKTuplesNormalizationBounds.leftPalmTargetPositionYMin * 0.95 
                 || headYawLinkLeftPalmTargetLocalPos.z > leftPalmFKTuplesNormalizationBounds.leftPalmTargetPositionZMax * 0.95 
                 || headYawLinkLeftPalmTargetLocalPos.z < leftPalmFKTuplesNormalizationBounds.leftPalmTargetPositionZMin * 0.95 
                ) {
                    newLeftPalmTargetObjectPos = this.headYawLinkOriginObject3D.worldToLocal(this.leftPalmTargetObjectLastSetPosition.clone());
                    this.leftPalmTargetObjectPrevGlobalPosition = undefined;
                    this.vLab.WebGLRendererCanvas.style.cursor = 'default';
                    newLeftPalmTargetObjectPos.copy(this.leftPalmTargetObjectLastSetPosition);
                } else {
                    this.leftPalmTargetObjectLastSetPosition = new THREE.Vector3().copy(newLeftPalmTargetObjectPos.clone());

                    this.leftPalmTargetObject.position.copy(newLeftPalmTargetObjectPos);
    
                    this.updateLeftPalmTargetDirectionFromHeadYawLinkOriginArrowHelper();

                    if (this.Valter.nature.ANNIK.leftPalmANNIK && this.valterLeftPalmIKTFModel !== undefined) {
                        /**
                         *
                         *
                             _           __ _     _____      _             _____ _  __
                            | |         / _| |   |  __ \    | |           |_   _| |/ /
                            | |     ___| |_| |_  | |__) |_ _| |_ __ ___     | | | ' / 
                            | |    / _ \  _| __| |  ___/ _` | | '_ ` _ \    | | |  <  
                            | |___|  __/ | | |_  | |  | (_| | | | | | | |  _| |_| . \ 
                            |______\___|_|  \__|_|_|   \__,_|_|_| |_| |_| |_____|_|\_\
                            |  __ \            | (_)    | | (_)
                            | |__) | __ ___  __| |_  ___| |_ _  ___  _ __
                            |  ___/ '__/ _ \/ _` | |/ __| __| |/ _ \| '_ \
                            | |   | | |  __/ (_| | | (__| |_| | (_) | | | |
                            |_|   |_|  \___|\__,_|_|\___|\__|_|\___/|_| |_|
                        *
                        *
                        */
                        let nLeftPalmTargetX = ANNUtils.normalizeNegPos(this.leftPalmTargetObject.position.x, leftPalmFKTuplesNormalizationBounds.leftPalmTargetPositionXMin, leftPalmFKTuplesNormalizationBounds.leftPalmTargetPositionXMax);
                        let nLeftPalmTargetY = ANNUtils.normalizeNegPos(this.leftPalmTargetObject.position.y, leftPalmFKTuplesNormalizationBounds.leftPalmTargetPositionYMin, leftPalmFKTuplesNormalizationBounds.leftPalmTargetPositionYMax);
                        let nLeftPalmTargetZ = ANNUtils.normalizeNegPos(this.leftPalmTargetObject.position.z, leftPalmFKTuplesNormalizationBounds.leftPalmTargetPositionZMin, leftPalmFKTuplesNormalizationBounds.leftPalmTargetPositionZMax);

                        const valterLeftPalmIKreditction = this.valterLeftPalmIKTFModel.predict(tf.tensor([nLeftPalmTargetX, nLeftPalmTargetY, nLeftPalmTargetZ], [1, 3]));
                        const valterLeftPalmIKreditctionData = valterLeftPalmIKreditction.dataSync();

                        const shoulderLeftLinkValuePrediction = ANNUtils.deNormalizeNegPos(valterLeftPalmIKreditctionData[0], leftPalmFKTuplesNormalizationBounds.shoulderLeftLinkValueMin, leftPalmFKTuplesNormalizationBounds.shoulderLeftLinkValueMax);
                        const limbLeftLinkValuePrediction = ANNUtils.deNormalizeNegPos(valterLeftPalmIKreditctionData[1], leftPalmFKTuplesNormalizationBounds.limbLeftLinkValueMin, leftPalmFKTuplesNormalizationBounds.limbLeftLinkValueMax);
                        const armLeftLinkValuePrediction = ANNUtils.deNormalizeNegPos(valterLeftPalmIKreditctionData[2], leftPalmFKTuplesNormalizationBounds.armLeftLinkValueMin, leftPalmFKTuplesNormalizationBounds.armLeftLinkValueMax);
                        const forearmRollLeftLinkValuePrediction = ANNUtils.deNormalizeNegPos(valterLeftPalmIKreditctionData[3], leftPalmFKTuplesNormalizationBounds.forearmRollLeftLinkValueMin, leftPalmFKTuplesNormalizationBounds.forearmRollLeftLinkValueMax);

                        this.Valter.setShoulderLeftLink(shoulderLeftLinkValuePrediction);
                        this.Valter.setLimbLeftLink(limbLeftLinkValuePrediction);
                        this.Valter.setArmLeftLink(armLeftLinkValuePrediction);
                        this.Valter.setForearmRollLeftLink(forearmRollLeftLinkValuePrediction);
                    }
                }
            }
        }
        this.prevActionInitialEventCoords = new THREE.Vector2();
        this.prevActionInitialEventCoords.copy(currentActionInitialEventCoords);
    }

    setupLeftPalmTargetDirectionFromHeadYawLinkOriginArrowHelper() {
        this.Valter.baseFrame.updateMatrixWorld();
        let headYawLinkLeftPalmDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(this.headYawLinkLeftPalmTargetLocalPos);
        this.leftPalmFromHeadYawLinkArrowHelper = new THREE.ArrowHelper(this.headYawLinkLeftPalmTargetLocalPos.clone().normalize(), new THREE.Vector3(0.0, 0.0, 0.0), headYawLinkLeftPalmDistance, 0xffff00, 0.02, 0.01);
        this.headYawLinkOriginObject3D.add(this.leftPalmFromHeadYawLinkArrowHelper);
        this.Valter.selfMeshes.push(this.leftPalmFromHeadYawLinkArrowHelper.cone);
    }

    updateLeftPalmTargetDirectionFromHeadYawLinkOriginArrowHelper() {
        this.Valter.baseFrame.updateMatrixWorld();

        this.headYawLinkLeftPalmTargetLocalPos = this.leftPalmTargetObject.position.clone();
        this.headYawLinkLeftPalmTargetLocalPos = new THREE.Vector3(parseFloat(this.headYawLinkLeftPalmTargetLocalPos.x.toFixed(3)), parseFloat(this.headYawLinkLeftPalmTargetLocalPos.y.toFixed(3)), parseFloat(this.headYawLinkLeftPalmTargetLocalPos.z.toFixed(3)));
        let headYawLinkLeftPalmTargetObjectDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(this.headYawLinkLeftPalmTargetLocalPos);
        let headYawLinkLeftPalmTargetObjectDirection = this.headYawLinkLeftPalmTargetLocalPos.clone().normalize();

        if (this.Valter.nature.devHelpers.showLeftPalmTargetDirectionFromHeadYawLinkOrigin == true && this.leftPalmFromHeadYawLinkArrowHelper) {
            this.leftPalmFromHeadYawLinkArrowHelper.setDirection(headYawLinkLeftPalmTargetObjectDirection);
            this.leftPalmFromHeadYawLinkArrowHelper.setLength(headYawLinkLeftPalmTargetObjectDistance, 0.02, 0.01);
        }
    }

    updateLeftPalmDirectionFromHeadYawLinkOriginArrowHelper() {
        this.Valter.baseFrame.updateMatrixWorld();

        this.leftPalmTargetGlobalPosition = this.Valter.leftPalm.localToWorld(new THREE.Vector3());

        this.headYawLinkLeftPalmLocalPos = this.headYawLinkOriginObject3D.worldToLocal(this.leftPalmTargetGlobalPosition.clone());
        this.headYawLinkLeftPalmLocalPos = new THREE.Vector3(
                                                                parseFloat(this.headYawLinkLeftPalmLocalPos.x.toFixed(3)), 
                                                                parseFloat(this.headYawLinkLeftPalmLocalPos.y.toFixed(3)), 
                                                                parseFloat(this.headYawLinkLeftPalmLocalPos.z.toFixed(3)));
        let headYawLinkLeftPalmtDistance = new THREE.Vector3(0.0, 0.0, 0.0).distanceTo(this.headYawLinkLeftPalmLocalPos);
        let headYawLinkLeftPalmDirection = this.headYawLinkLeftPalmLocalPos.clone().normalize();

        if (this.leftPalmFromHeadYawLinkArrowHelper) {
            this.leftPalmFromHeadYawLinkArrowHelper.setDirection(headYawLinkLeftPalmDirection);
            this.leftPalmFromHeadYawLinkArrowHelper.setLength(headYawLinkLeftPalmtDistance, 0.02, 0.01);
        }
    }


    commonInvAction() {
        this.headTargetObjectPrevGlobalPosition = undefined;
        this.rightPalmTargetObjectPrevGlobalPosition = undefined;
        this.leftPalmTargetObjectPrevGlobalPosition = undefined;
        this.vLab.WebGLRendererCanvas.style.cursor = 'default';
        this.vLab.SceneDispatcher.currentVLabScene.currentControls.enable();
    }
}
export default ValterIK;