import * as tf from '@tensorflow/tfjs';
import * as ANNUtils from '../../../../vlab.fwk/utils/ann.utils';
import ValterRightPalmFKTuple from '../model/valter-right-palm-fk-tuple';

/**
 * Valter Right Palm IK dev class.
 * @class
 * @classdesc Valter The Robot Right Palm IK methods aggregation.
 */
class ValterRightPalmIKDev {
    constructor(Valter) {
        /**
         * Valter instance
         */
        this.Valter = Valter;
        /**
         * Valter.vLab VLab Instance
         */
        this.vLab = this.Valter.vLab;
        /**
         * Throttling of data
         */
        this.Valter.ValterIK.rightPalmIKDataThrottlingSigma = 0.025;
    }

    /**
     * 
     * Right Palm FK tuples 
     * 
     */
    getValterRightPalmFKTuples() {
        this.setValterShoulderRightLinkValue = this.setValterShoulderRightLinkValue.bind(this);
        this.setValterLimbRightLinkValue = this.setValterLimbRightLinkValue.bind(this);
        this.setValterArmRightLinkValue = this.setValterArmRightLinkValue.bind(this);
        this.setValterForearmRollRightLinkValue = this.setValterForearmRollRightLinkValue.bind(this);
        this.persistRightPalmTargetPosition = this.persistRightPalmTargetPosition.bind(this);

        this.Valter.ValterLinks.shoulderRightLink.step = 0.1;
        this.Valter.ValterLinks.limbRightLink.step = 0.2;
        this.Valter.ValterLinks.armRightLink.step = 0.2;
        this.Valter.ValterLinks.forearmRollRightLink.step = 0.1;

        this.Valter.setShoulderRightLink(this.Valter.ValterLinks.shoulderRightLink.min);
        this.Valter.setLimbRightLink(this.Valter.ValterLinks.limbRightLink.min);
        this.Valter.setArmRightLink(this.Valter.ValterLinks.armRightLink.min);
        this.Valter.setForearmRollRightLink(this.Valter.ValterLinks.forearmRollRightLink.min);

        this.setValterForearmRollRightLinkValue();
    }

    setValterShoulderRightLinkValue() {
        if (this.Valter.ValterLinks.shoulderRightLink.value < this.Valter.ValterLinks.shoulderRightLink.max) {
            this.persistRightPalmTargetPosition()
            .then(() => {
                this.Valter.ValterLinks.shoulderRightLink.value += this.Valter.ValterLinks.shoulderRightLink.step;
                this.Valter.setShoulderRightLink(this.Valter.ValterLinks.shoulderRightLink.value);

                this.setValterForearmRollRightLinkValue();
            });
        } else {
            this.Valter.ValterLinks.shoulderRightLink.value = this.Valter.ValterLinks.shoulderRightLink.min;
            this.Valter.setShoulderRightLink(this.Valter.ValterLinks.shoulderRightLink.value);

            this.setValterLimbRightLinkValue();
        }
    }

    setValterLimbRightLinkValue() {
        if (this.Valter.ValterLinks.limbRightLink.value < this.Valter.ValterLinks.limbRightLink.max) {
            this.persistRightPalmTargetPosition()
            .then(() => {
                this.Valter.ValterLinks.limbRightLink.value += this.Valter.ValterLinks.limbRightLink.step;
                this.Valter.setLimbRightLink(this.Valter.ValterLinks.limbRightLink.value);

                this.setValterForearmRollRightLinkValue();
            });

        } else {
            this.Valter.ValterLinks.limbRightLink.value = this.Valter.ValterLinks.limbRightLink.min;
            this.Valter.setLimbRightLink(this.Valter.ValterLinks.limbRightLink.value);

            this.setValterArmRightLinkValue();
        }
    }

    setValterArmRightLinkValue() {
        if (this.Valter.ValterLinks.armRightLink.value < this.Valter.ValterLinks.armRightLink.max) {
            this.persistRightPalmTargetPosition()
            .then(() => {
                this.Valter.ValterLinks.armRightLink.value += this.Valter.ValterLinks.armRightLink.step;
                this.Valter.setArmRightLink(this.Valter.ValterLinks.armRightLink.value);

                this.setValterForearmRollRightLinkValue();
            });
        } else {
            this.Valter.ValterLinks.armRightLink.value = this.Valter.ValterLinks.armRightLink.min;
            this.Valter.setArmRightLink(this.Valter.ValterLinks.armRightLink.value);
        }
    }

    setValterForearmRollRightLinkValue() {
        if (this.Valter.ValterLinks.forearmRollRightLink.value < this.Valter.ValterLinks.forearmRollRightLink.max) {
            this.persistRightPalmTargetPosition()
            .then(() => {
                this.Valter.ValterLinks.forearmRollRightLink.value += this.Valter.ValterLinks.forearmRollRightLink.step;
                this.Valter.setForearmRollRightLink(this.Valter.ValterLinks.forearmRollRightLink.value);

                this.setValterForearmRollRightLinkValue();
            });
        } else {
            this.Valter.ValterLinks.forearmRollRightLink.value = this.Valter.ValterLinks.forearmRollRightLink.min;
            this.Valter.setForearmRollRightLink(this.Valter.ValterLinks.forearmRollRightLink.value);

            this.setValterShoulderRightLinkValue();
        }
    }

    persistRightPalmTargetPosition() {
        return new Promise((resolve, reject) => {
            this.Valter.ValterIK.updateRightPalmDirectionFromHeadYawLinkOriginArrowHelper();

            let valterRightPalmFKTuple = new ValterRightPalmFKTuple();
            valterRightPalmFKTuple.rightPalmTargetPosition.x = this.Valter.ValterIK.headYawLinkRightPalmLocalPos.x;
            valterRightPalmFKTuple.rightPalmTargetPosition.y = this.Valter.ValterIK.headYawLinkRightPalmLocalPos.y;
            valterRightPalmFKTuple.rightPalmTargetPosition.z = this.Valter.ValterIK.headYawLinkRightPalmLocalPos.z;
            valterRightPalmFKTuple.shoulderRightLinkValue = parseFloat(this.Valter.ValterLinks.shoulderRightLink.value.toFixed(3));
            valterRightPalmFKTuple.limbRightLinkValue = parseFloat(this.Valter.ValterLinks.limbRightLink.value.toFixed(3));
            valterRightPalmFKTuple.armRightLinkValue = parseFloat(this.Valter.ValterLinks.armRightLink.value.toFixed(3));
            valterRightPalmFKTuple.forearmRollRightLinkValue = parseFloat(this.Valter.ValterLinks.forearmRollRightLink.value.toFixed(3));

            this.vLab.VLabsRESTClientManager.ValterRightPalmIKService.saveRightPalmFKTuple(valterRightPalmFKTuple)
            .then(result => {
                resolve();
            });
        });
    }

    /**
     * 
     * Right Palm IK solving with TFjs
     * 
     */
    printRightPalmFKTuplesNormalizationBounds(sigma) {
        this.vLab.VLabsRESTClientManager.ValterRightPalmIKService.getRightPalmFKTuplesNormalizationBounds(sigma)
        .then(rightPalmFKTuplesNormalizationBounds => {
            let ValterNatureANNIKRightPalmFKTuplesNormalizationBounds = '"rightPalmFKTuplesNormalizationBounds": {\n';
            Object.keys(rightPalmFKTuplesNormalizationBounds).forEach((key) => {
                ValterNatureANNIKRightPalmFKTuplesNormalizationBounds += '"' + key + '": ' + rightPalmFKTuplesNormalizationBounds[key] + ',\n';
            });
            ValterNatureANNIKRightPalmFKTuplesNormalizationBounds = ValterNatureANNIKRightPalmFKTuplesNormalizationBounds.substr(0, ValterNatureANNIKRightPalmFKTuplesNormalizationBounds.length - 2);
            ValterNatureANNIKRightPalmFKTuplesNormalizationBounds += '\n}';
            console.log(ValterNatureANNIKRightPalmFKTuplesNormalizationBounds);
        });
    }

    prepareValterRightPalmFKTuples() {
        return new Promise((resolve, reject) => {
            this.vLab.VLabsRESTClientManager.ValterRightPalmIKService.getAllRightPalmFKTuplesNormalized(this.Valter.ValterIK.rightPalmIKDataThrottlingSigma)
            .then(rightPalmFKNormalizedTuples => {
                resolve(rightPalmFKNormalizedTuples);
            });
        });
    }

    prepareValterRightPalmIKTrainingData(rightPalmFKTuples) {
        let valterRightPalmIKTrainingData = {};
        return new Promise((resolve, reject) => {
            /**
             * Input tensor built from ValterRightPalmFKTuple.rightPalmTargetPosition records
             * 
             * inputTensorValues: [ValterRightPalmFKTuple.rightPalmTargetPosition.x, ValterRightPalmFKTuple.rightPalmTargetPosition.y, ValterRightPalmFKTuple.rightPalmTargetPosition.z, ...]
             * inputTensorShape: [rightPalmFKTuples.length, 3]
             */
            let inputTensorValues = [];
            /**
             * Output tensor built from 
             *      ValterRightPalmFKTuple.shoulderRightLinkValue
             *      ValterRightPalmFKTuple.limbRightLinkValue
             *      ValterRightPalmFKTuple.armRightLinkValue
             *      ValterRightPalmFKTuple.forearmRollRightLinkValue
             * 
             * outputTensorValues: [ValterRightPalmFKTuple.shoulderRightLinkValue, ValterRightPalmFKTuple.limbRightLinkValue, ValterRightPalmFKTuple.armRightLinkValue, ValterRightPalmFKTuple.forearmRollRightLinkValue, ...]
             * outputTensorShape: [rightPalmFKTuples.length, 4]
             */
            let outputTensorValues = [];

            /**
             * Pushing values to inputTensorValues and outputTensorValues
             */
            rightPalmFKTuples.forEach(rightPalmFKTuple => {
                inputTensorValues.push(rightPalmFKTuple.rightPalmTargetPosition.x, rightPalmFKTuple.rightPalmTargetPosition.y, rightPalmFKTuple.rightPalmTargetPosition.z);
                outputTensorValues.push(rightPalmFKTuple.shoulderRightLinkValue, rightPalmFKTuple.limbRightLinkValue, rightPalmFKTuple.armRightLinkValue, rightPalmFKTuple.forearmRollRightLinkValue);
            });

            valterRightPalmIKTrainingData.inputTensorValues  = inputTensorValues;
            valterRightPalmIKTrainingData.inputTensorShape  = [rightPalmFKTuples.length, 3];

            valterRightPalmIKTrainingData.outputTensorValues = outputTensorValues;
            valterRightPalmIKTrainingData.outputTensorShape = [rightPalmFKTuples.length, 4];

            resolve(valterRightPalmIKTrainingData);
        });
    }

    prepareValterRightPalmFKtoIKSolving() {
        return new Promise((resolve, reject) => {
            this.prepareValterRightPalmFKTuples().then((rightPalmFKTuples) => {
                this.prepareValterRightPalmIKTrainingData(rightPalmFKTuples).then((valterRightPalmIKTrainingData) => {
                    const inputTensor = tf.tensor(valterRightPalmIKTrainingData.inputTensorValues, valterRightPalmIKTrainingData.inputTensorShape);
                    const outpuTensor = tf.tensor(valterRightPalmIKTrainingData.outputTensorValues, valterRightPalmIKTrainingData.outputTensorShape);

                    const optimizer = tf.train.sgd(0.1);
                    const loss = 'meanSquaredError';

                    tf.loadLayersModel('localstorage://valter-right-palm-ik-model')
                    .then((savedModel) => {
                        const model = savedModel;

                        // Specify the loss type and optimizer for training.
                        model.compile({loss: loss, optimizer: optimizer, metrics: ['accuracy']});

                        const valterRightPalmFKtoIKSolver = {
                            model: model,
                            inputTensor: inputTensor,
                            outpuTensor: outpuTensor
                        };
                        resolve(valterRightPalmFKtoIKSolver);
                    })
                    .catch(error => {
                        // A sequential model is a container which you can add layers to.
                        const model = tf.sequential();
                        model.add(tf.layers.dense({inputShape: [valterRightPalmIKTrainingData.inputTensorShape[1]], units: 32, activation: 'elu'}));
                        model.add(tf.layers.dense({units: 4, activation: 'elu'}));

                        // Specify the loss type and optimizer for training.
                        model.compile({loss: loss, optimizer: optimizer, metrics: ['accuracy']});

                        const valterRightPalmFKtoIKSolver = {
                            model: model,
                            inputTensor: inputTensor,
                            outpuTensor: outpuTensor
                        };
                        resolve(valterRightPalmFKtoIKSolver);
                    });
                });
            });
        });
    }

    fitAndSaveRightPalmTargetIKModel() {
        tf.setBackend('webgl');
        console.log('TF Backend:', tf.getBackend());
        this.prepareValterRightPalmFKtoIKSolving().then((valterRightPalmFKtoIKSolver) => {
            this.valterRightPalmFKtoIKSolver = valterRightPalmFKtoIKSolver;

            this.vLab.renderPaused = true;

            // Train the model.
            console.log(this.valterRightPalmFKtoIKSolver);
            console.log('Training ValterRightPalmFKtoIKSolver Model ...');
            // We'll keep a buffer of loss and accuracy values over time.
            let trainBatchCount = 0;
            let trainEpochCount = 0;
            let trainEpochs = 2000;
            this.valterRightPalmFKtoIKSolver.model.fit(
                this.valterRightPalmFKtoIKSolver.inputTensor, 
                this.valterRightPalmFKtoIKSolver.outpuTensor, 
                {
                    epochs: trainEpochs,
                    // batchSize: 500,
                    shuffle: true,
                    //validationData: [this.valterRightPalmFKtoIKSolver.inputTensor, this.valterRightPalmFKtoIKSolver.outpuTensor],
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
                this.vLab.renderPaused = false;

                console.log(result);

                this.valterRightPalmFKtoIKSolver.model.save('localstorage://valter-right-palm-ik-model').then(() => {
                    tf.loadLayersModel('localstorage://valter-right-palm-ik-model').then((model) => {
                        this.valterRightPalmFKtoIKSolver.model = model;

                        let rightPalmNormalizationBounds = this.Valter.nature.ANNIK.rightPalmFKTuplesNormalizationBounds;

                        /**
                         * db.valter_right_palm_fk_tuples.find().sort({ $natural: 1 }).limit(1).pretty()
                         */
                        let input1 = [-0.533, 0.206, 0.097];
                        input1[0] = ANNUtils.normalizeNegPos(input1[0], rightPalmNormalizationBounds.rightPalmTargetPositionXMin, rightPalmNormalizationBounds.rightPalmTargetPositionXMax);
                        input1[1] = ANNUtils.normalizeNegPos(input1[1], rightPalmNormalizationBounds.rightPalmTargetPositionYMin, rightPalmNormalizationBounds.rightPalmTargetPositionYMax);
                        input1[2] = ANNUtils.normalizeNegPos(input1[2], rightPalmNormalizationBounds.rightPalmTargetPositionZMin, rightPalmNormalizationBounds.rightPalmTargetPositionZMax);
                        const prediction1 = this.valterRightPalmFKtoIKSolver.model.predict(tf.tensor(input1, [1, 3]));
                        let output1Preditcion = prediction1.dataSync();
                        let output1 = [
                            ANNUtils.deNormalizeNegPos(output1Preditcion[0], rightPalmNormalizationBounds.shoulderRightLinkValueMin, rightPalmNormalizationBounds.shoulderRightLinkValueMax),
                            ANNUtils.deNormalizeNegPos(output1Preditcion[0], rightPalmNormalizationBounds.limbRightLinkValueMin, rightPalmNormalizationBounds.limbRightLinkValueMax),
                            ANNUtils.deNormalizeNegPos(output1Preditcion[0], rightPalmNormalizationBounds.armRightLinkValueMin, rightPalmNormalizationBounds.armRightLinkValueMax),
                            ANNUtils.deNormalizeNegPos(output1Preditcion[0], rightPalmNormalizationBounds.forearmRollRightLinkValueMin, rightPalmNormalizationBounds.forearmRollRightLinkValueMax),
                        ];
                        console.log('FK Tuple [-0.533, 0.206, 0.097] -> [0, -1.48, -1.38, -0.65]');
                        console.log('shoulderRightLinkValue, limbRightLinkValue, armRightLinkValue, forearmRollRightLinkValue prediction: [' + output1[0].toFixed(3) + ', ' + output1[1].toFixed(3) + ', ' + output1[2].toFixed(3) + ', ' + output1[3].toFixed(3) + ' ]');

                        /**
                         * db.valter_right_palm_fk_tuples.find().sort({ $natural: -1 }).limit(1).pretty()
                         */
                        let input2 = [-0.8, -0.59, 0.011];
                        input2[0] = ANNUtils.normalizeNegPos(input2[0], rightPalmNormalizationBounds.rightPalmTargetPositionXMin, rightPalmNormalizationBounds.rightPalmTargetPositionXMax);
                        input2[1] = ANNUtils.normalizeNegPos(input2[1], rightPalmNormalizationBounds.rightPalmTargetPositionYMin, rightPalmNormalizationBounds.rightPalmTargetPositionYMax);
                        input2[2] = ANNUtils.normalizeNegPos(input2[2], rightPalmNormalizationBounds.rightPalmTargetPositionZMin, rightPalmNormalizationBounds.rightPalmTargetPositionZMax);
                        const prediction2 = this.valterRightPalmFKtoIKSolver.model.predict(tf.tensor(input2, [1, 3]));
                        let output2Preditcion = prediction2.dataSync();
                        let output2 = [
                            ANNUtils.deNormalizeNegPos(output2Preditcion[0], rightPalmNormalizationBounds.shoulderRightLinkValueMin, rightPalmNormalizationBounds.shoulderRightLinkValueMax),
                            ANNUtils.deNormalizeNegPos(output2Preditcion[0], rightPalmNormalizationBounds.limbRightLinkValueMin, rightPalmNormalizationBounds.limbRightLinkValueMax),
                            ANNUtils.deNormalizeNegPos(output2Preditcion[0], rightPalmNormalizationBounds.armRightLinkValueMin, rightPalmNormalizationBounds.armRightLinkValueMax),
                            ANNUtils.deNormalizeNegPos(output2Preditcion[0], rightPalmNormalizationBounds.forearmRollRightLinkValueMin, rightPalmNormalizationBounds.forearmRollRightLinkValueMax),
                        ];
                        console.log('FK Tuple [-0.8, -0.59, 0.011] -> [1.1, 1.12, 0.02, 1.15]');
                        console.log('shoulderRightLinkValue, limbRightLinkValue, armRightLinkValue, forearmRollRightLinkValue prediction: [' + output2[0].toFixed(3) + ', ' + output2[1].toFixed(3) + ', ' + output2[2].toFixed(3) + ', ' + output2[3].toFixed(3) + ' ]');
                    });
                });
            });
        });
    }

    saveValterRightPalmTargetIKModelToLocalFile() {
        if (this.Valter.nature.ANNIK.rightPalmANNIK) {
            tf.loadLayersModel('localstorage://valter-right-palm-ik-model')
            .then((model) => {
                model.save('downloads://valter-right-palm-ik-model');
            })
            .catch(error => {
                console.error(error.message);
            });
        }
    }
}
export default ValterRightPalmIKDev;