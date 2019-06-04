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

        this.vLab.renderPaused = true;
    }

    onActivated() {
        console.log(this.vLab.nature.name);
        console.log('https://www.tensorflow.org/js/guide/');
        console.log('https://github.com/tensorflow/tfjs-examples');
        console.log('https://www.youtube.com/watch?v=XdErOpUzupY');
        tf.setBackend('webgl');
        console.log('TF Backend:', tf.getBackend());
        this.prepareValterHeadFKtoIKSolving().then((valterHeadFKtoIKSolver) => {
            this.valterHeadFKtoIKSolver = valterHeadFKtoIKSolver;

            // Train the model.
            console.log(this.valterHeadFKtoIKSolver);
            console.log('Training ValterHeadFKtoIKSolver Model ...');
            // We'll keep a buffer of loss and accuracy values over time.
            let trainBatchCount = 0;
            let trainEpochCount = 0;
            let trainEpochs = 50;
            this.valterHeadFKtoIKSolver.model.fit(
                this.valterHeadFKtoIKSolver.inputTensor, 
                this.valterHeadFKtoIKSolver.outpuTensor, 
                {
                    epochs: trainEpochs,
                    // batchSize: 100,
                    shuffle: true,
                    //validationData: [this.valterHeadFKtoIKSolver.inputTensor, this.valterHeadFKtoIKSolver.outpuTensor],
                    callbacks: {
                        // onBatchEnd: (batch, logs) => {
                        //     trainBatchCount++;
                        //     console.log(trainBatchCount, logs.loss);
                        // },
                        onEpochEnd: (epoch, logs) => {
                            trainEpochCount++;
                            console.log(trainEpochCount + ' / ' + trainEpochs, logs);
                        }
                    }
                }
            ).then((result) => {
                console.log(result);

                this.valterHeadFKtoIKSolver.model.save('localstorage://valter-head-ik-model').then(() => {

                    tf.loadLayersModel('localstorage://valter-head-ik-model').then((model) => {
                        this.valterHeadFKtoIKSolver.model = model;

                        /**
                         * db.valter_head_fk_tuples.find().sort({ $natural: 1 }).limit(1).pretty()
                         */
                        const output1 = this.valterHeadFKtoIKSolver.model.predict(tf.tensor([-0.366, -0.284, 0.099], [1, 3]));
                        output1.print();
                        console.log('[-0.366, -0.284, 0.099] -> [-1.350, -1.000]');
                        /**
                         * db.valter_head_fk_tuples.find().sort({ $natural: -1 }).limit(1).pretty()
                         */
                        const output2 = this.valterHeadFKtoIKSolver.model.predict(tf.tensor([2.754, -0.394, 0.898], [1, 3]));
                        output2.print();
                        console.log('[2.754, -0.394, 0.898] -> [1.350, 0.1]');
                    });
                });
            });
        });
    }

    prepareValterHeadFKtoIKSolving() {
        return new Promise((resolve, reject) => {
            this.prepareValterHeadFKTuples().then((headFKTuples) => {
                this.prepareValterHeadIKTrainingData(headFKTuples).then((valterHeadIKTrainingData) => {
                    const inputTensor = tf.tensor(valterHeadIKTrainingData.inputTensorValues, valterHeadIKTrainingData.inputTensorShape);
                    const outpuTensor = tf.tensor(valterHeadIKTrainingData.outputTensorValues, valterHeadIKTrainingData.outputTensorShape);

                    const optimizer = tf.train.sgd(0.2);
                    const loss = 'meanSquaredError';

                    tf.loadLayersModel('localstorage://valter-head-ik-model')
                    .then((savedModel) => {
                        const model = savedModel;

                        // Specify the loss type and optimizer for training.
                        model.compile({loss: loss, optimizer: optimizer, metrics: ['accuracy']});

                        const valterHeadFKtoIKSolver = {
                            model: model,
                            inputTensor: inputTensor,
                            outpuTensor: outpuTensor
                        };
                        resolve(valterHeadFKtoIKSolver);
                    })
                    .catch(error => {
                        // A sequential model is a container which you can add layers to.
                        const model = tf.sequential();
                        model.add(tf.layers.dense({inputShape: [valterHeadIKTrainingData.inputTensorShape[1]], units: 12, activation: 'relu'}));
                        model.add(tf.layers.dense({units: 6, activation: 'elu'}));
                        model.add(tf.layers.dense({units: 2, activation: 'elu'}));

                        // Specify the loss type and optimizer for training.
                        model.compile({loss: loss, optimizer: optimizer, metrics: ['accuracy']});

                        const valterHeadFKtoIKSolver = {
                            model: model,
                            inputTensor: inputTensor,
                            outpuTensor: outpuTensor
                        };
                        resolve(valterHeadFKtoIKSolver);
                    });
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
             * Input tensor built from ValterHeadFKTuple.headTargetPosition records
             * 
             * inputTensorValues: [ValterHeadFKTuple.headTargetPosition.x, ValterHeadFKTuple.headTargetPosition.y, ValterHeadFKTuple.headTargetPosition.z, ...]
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
                inputTensorValues.push(headFKTuple.headTargetPosition.x, headFKTuple.headTargetPosition.y, headFKTuple.headTargetPosition.z);
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