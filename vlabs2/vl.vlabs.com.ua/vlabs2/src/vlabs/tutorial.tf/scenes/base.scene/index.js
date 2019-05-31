import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';

import * as tf from '@tensorflow/tfjs';

class BaseScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);
    }
    /**
     * Override VLabScene.onLoaded and called when VLabScene nature JSON is loaded as minimum
     */
    onLoaded() {
        console.log('BaseScene onLoaded()');
        /**
         * Trace VLabScene object (this)
         */
        console.log(this);

        /*<dev>*/
        /**
         * dummyObject
         */
        this.dummyObject.position.copy(new THREE.Vector3(0.1, 0.1, 0.1));
        /*</dev>*/

        console.clear();
    }

    onActivated() {
        console.log(this.vLab.nature.name);
        console.log('https://www.tensorflow.org/js/guide/');
        this.prepareValterHeadFKtoIKSolving().then((valterHeadFKtoIKSolver) => {
            this.valterHeadFKtoIKSolver = valterHeadFKtoIKSolver;

            // Train the model.
            console.log('Training ValterHeadFKtoIKSolver Model ...');
            // We'll keep a buffer of loss and accuracy values over time.
            let trainBatchCount = 0;
            this.valterHeadFKtoIKSolver.model.fit(
                this.valterHeadFKtoIKSolver.inputTensor, 
                this.valterHeadFKtoIKSolver.outpuTensor,  
                {
                    epochs: 10,
                    callbacks: {
                        onBatchEnd: (batch, logs) => {
                            trainBatchCount++;
                            console.log(trainBatchCount, logs.loss);
                        }
                    }
                }
            ).then((result) => {
                console.log(result);
                const output = this.valterHeadFKtoIKSolver.model.predict(tf.tensor([0.262, 0.001, 0.965], [1, 3]));
                output.print();
            });
        });
    }

    prepareValterHeadFKtoIKSolving() {
        return new Promise((resolve, reject) => {
            this.prepareValterHeadFKTuples().then((headFKTuples) => {
                this.prepareValterHeadIKTrainingData(headFKTuples).then((valterHeadIKTrainingData) => {
                    const inputTensor = tf.tensor(valterHeadIKTrainingData.inputTensorValues, valterHeadIKTrainingData.inputTensorShape);
                    const outpuTensor = tf.tensor(valterHeadIKTrainingData.outputTensorValues, valterHeadIKTrainingData.outputTensorShape);

                    // A sequential model is a container which you can add layers to.
                    const model = tf.sequential();
                    model.add(tf.layers.dense({inputShape: [valterHeadIKTrainingData.inputTensorShape[1]], units: 2, activation: 'relu'}));
                    // Specify the loss type and optimizer for training.
                    model.compile({loss: 'meanSquaredError', optimizer: 'SGD'});

                    const valterHeadFKtoIKSolver = {
                        model: model,
                        inputTensor: inputTensor,
                        outpuTensor: outpuTensor
                    };
                    resolve(valterHeadFKtoIKSolver);
                });
            });
        });
    }

    prepareValterHeadFKTuples() {
        return new Promise((resolve, reject) => {
            this.vLab.VLabsRESTClientManager.ValterHeadIKService.getAllHeadFKTuples()
            .then(headFKTuples => {
                resolve(headFKTuples);
            });
        });
    }

    prepareValterHeadIKTrainingData(headFKTuples) {
        let valterHeadIKTrainingData = {};
        return new Promise((resolve, reject) => {
            /**
             * Input tensor built from ValterHeadFKTuple.headTargetDirection records
             * 
             * inputTensorValues: [ValterHeadFKTuple.headTargetDirection.x, ValterHeadFKTuple.headTargetDirection.y, ValterHeadFKTuple.headTargetDirection.z, ...]
             * inputTensorShape: [headFKTuples.length, 3]
             */
            let inputTensorValues = [];
            /**
             * Output tensor built from ValterHeadFKTuple.headYawLinkValue and ValterHeadFKTuple.headTiltLinkValue records
             * 
             * outputTensorValues: [ValterHeadFKTuple.headYawLinkValue, ValterHeadFKTuple.headTiltLinkValue, ...]
             * outputTensorShape: [headFKTuples.length, 2]
             */
            let outputTensorValues = [];

            /**
             * Pushing values to inputTensorValues and outputTensorValues
             */
            headFKTuples.forEach(headFKTuple => {
                inputTensorValues.push(headFKTuple.headTargetDirection.x, headFKTuple.headTargetDirection.y, headFKTuple.headTargetDirection.z);
                outputTensorValues.push(headFKTuple.headYawLinkValue, headFKTuple.headTiltLinkValue);
            });

            valterHeadIKTrainingData.inputTensorValues  = inputTensorValues;
            valterHeadIKTrainingData.inputTensorShape  = [headFKTuples.length, 3];

            valterHeadIKTrainingData.outputTensorValues = outputTensorValues;
            valterHeadIKTrainingData.outputTensorShape = [headFKTuples.length, 2];

            resolve(valterHeadIKTrainingData);
        });
    }
}

export default BaseScene;