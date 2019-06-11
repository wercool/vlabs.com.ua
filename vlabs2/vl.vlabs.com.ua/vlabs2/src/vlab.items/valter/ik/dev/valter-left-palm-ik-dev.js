import * as tf from '@tensorflow/tfjs';
import * as ANNUtils from '../../../../vlab.fwk/utils/ann.utils';
import ValterLeftPalmFKTuple from '../model/valter-left-palm-fk-tuple';

/**
 * Valter Left Palm IK dev class.
 * @class
 * @classdesc Valter The Robot Left Palm IK methods aggregation.
 */
class ValterLeftPalmIKDev {
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
        this.Valter.ValterIK.leftPalmIKDataThrottlingSigma = 0.025;
    }

    /**
     * 
     * Left Palm FK tuples 
     * 
     */
    getValterLeftPalmFKTuples() {
        this.setValterShoulderLeftLinkValue = this.setValterShoulderLeftLinkValue.bind(this);
        this.setValterLimbLeftLinkValue = this.setValterLimbLeftLinkValue.bind(this);
        this.setValterArmLeftLinkValue = this.setValterArmLeftLinkValue.bind(this);
        this.setValterForearmRollLeftLinkValue = this.setValterForearmRollLeftLinkValue.bind(this);
        this.persistLeftPalmTargetPosition = this.persistLeftPalmTargetPosition.bind(this);

        this.Valter.ValterLinks.shoulderLeftLink.step = 0.1;
        this.Valter.ValterLinks.limbLeftLink.step = 0.2;
        this.Valter.ValterLinks.armLeftLink.step = 0.2;
        this.Valter.ValterLinks.forearmRollLeftLink.step = 0.1;

        this.Valter.setShoulderLeftLink(this.Valter.ValterLinks.shoulderLeftLink.min);
        this.Valter.setLimbLeftLink(this.Valter.ValterLinks.limbLeftLink.min);
        this.Valter.setArmLeftLink(this.Valter.ValterLinks.armLeftLink.min);
        this.Valter.setForearmRollLeftLink(this.Valter.ValterLinks.forearmRollLeftLink.min);

        this.setValterForearmRollLeftLinkValue();
    }

    setValterShoulderLeftLinkValue() {
        if (this.Valter.ValterLinks.shoulderLeftLink.value < this.Valter.ValterLinks.shoulderLeftLink.max) {
            this.persistLeftPalmTargetPosition()
            .then(() => {
                this.Valter.ValterLinks.shoulderLeftLink.value += this.Valter.ValterLinks.shoulderLeftLink.step;
                this.Valter.setShoulderLeftLink(this.Valter.ValterLinks.shoulderLeftLink.value);

                this.setValterForearmRollLeftLinkValue();
            });
        } else {
            this.Valter.ValterLinks.shoulderLeftLink.value = this.Valter.ValterLinks.shoulderLeftLink.min;
            this.Valter.setShoulderLeftLink(this.Valter.ValterLinks.shoulderLeftLink.value);

            this.setValterLimbLeftLinkValue();
        }
    }

    setValterLimbLeftLinkValue() {
        if (this.Valter.ValterLinks.limbLeftLink.value < this.Valter.ValterLinks.limbLeftLink.max) {
            this.persistLeftPalmTargetPosition()
            .then(() => {
                this.Valter.ValterLinks.limbLeftLink.value += this.Valter.ValterLinks.limbLeftLink.step;
                this.Valter.setLimbLeftLink(this.Valter.ValterLinks.limbLeftLink.value);

                this.setValterForearmRollLeftLinkValue();
            });

        } else {
            this.Valter.ValterLinks.limbLeftLink.value = this.Valter.ValterLinks.limbLeftLink.min;
            this.Valter.setLimbLeftLink(this.Valter.ValterLinks.limbLeftLink.value);

            this.setValterArmLeftLinkValue();
        }
    }

    setValterArmLeftLinkValue() {
        if (this.Valter.ValterLinks.armLeftLink.value < this.Valter.ValterLinks.armLeftLink.max) {
            this.persistLeftPalmTargetPosition()
            .then(() => {
                this.Valter.ValterLinks.armLeftLink.value += this.Valter.ValterLinks.armLeftLink.step;
                this.Valter.setArmLeftLink(this.Valter.ValterLinks.armLeftLink.value);

                this.setValterForearmRollLeftLinkValue();
            });
        } else {
            this.Valter.ValterLinks.armLeftLink.value = this.Valter.ValterLinks.armLeftLink.min;
            this.Valter.setArmLeftLink(this.Valter.ValterLinks.armLeftLink.value);
        }
    }

    setValterForearmRollLeftLinkValue() {
        if (this.Valter.ValterLinks.forearmRollLeftLink.value < this.Valter.ValterLinks.forearmRollLeftLink.max) {
            this.persistLeftPalmTargetPosition()
            .then(() => {
                this.Valter.ValterLinks.forearmRollLeftLink.value += this.Valter.ValterLinks.forearmRollLeftLink.step;
                this.Valter.setForearmRollLeftLink(this.Valter.ValterLinks.forearmRollLeftLink.value);

                this.setValterForearmRollLeftLinkValue();
            });
        } else {
            this.Valter.ValterLinks.forearmRollLeftLink.value = this.Valter.ValterLinks.forearmRollLeftLink.min;
            this.Valter.setForearmRollLeftLink(this.Valter.ValterLinks.forearmRollLeftLink.value);

            this.setValterShoulderLeftLinkValue();
        }
    }

    persistLeftPalmTargetPosition() {
        return new Promise((resolve, reject) => {
            this.Valter.ValterIK.updateLeftPalmDirectionFromHeadYawLinkOriginArrowHelper();

            let valterLeftPalmFKTuple = new ValterLeftPalmFKTuple();
            valterLeftPalmFKTuple.leftPalmTargetPosition.x = this.Valter.ValterIK.headYawLinkLeftPalmLocalPos.x;
            valterLeftPalmFKTuple.leftPalmTargetPosition.y = this.Valter.ValterIK.headYawLinkLeftPalmLocalPos.y;
            valterLeftPalmFKTuple.leftPalmTargetPosition.z = this.Valter.ValterIK.headYawLinkLeftPalmLocalPos.z;
            valterLeftPalmFKTuple.shoulderLeftLinkValue = parseFloat(this.Valter.ValterLinks.shoulderLeftLink.value.toFixed(3));
            valterLeftPalmFKTuple.limbLeftLinkValue = parseFloat(this.Valter.ValterLinks.limbLeftLink.value.toFixed(3));
            valterLeftPalmFKTuple.armLeftLinkValue = parseFloat(this.Valter.ValterLinks.armLeftLink.value.toFixed(3));
            valterLeftPalmFKTuple.forearmRollLeftLinkValue = parseFloat(this.Valter.ValterLinks.forearmRollLeftLink.value.toFixed(3));

            this.vLab.VLabsRESTClientManager.ValterLeftPalmIKService.saveLeftPalmFKTuple(valterLeftPalmFKTuple)
            .then(result => {
                resolve();
            });
        });
    }

    /**
     * 
     * Left Palm IK solving with TFjs
     * 
     */
    printLeftPalmFKTuplesNormalizationBounds(sigma) {
        this.vLab.VLabsRESTClientManager.ValterLeftPalmIKService.getLeftPalmFKTuplesNormalizationBounds(sigma)
        .then(leftPalmFKTuplesNormalizationBounds => {
            let ValterNatureANNIKLeftPalmFKTuplesNormalizationBounds = '"leftPalmFKTuplesNormalizationBounds": {\n';
            Object.keys(leftPalmFKTuplesNormalizationBounds).forEach((key) => {
                ValterNatureANNIKLeftPalmFKTuplesNormalizationBounds += '"' + key + '": ' + leftPalmFKTuplesNormalizationBounds[key] + ',\n';
            });
            ValterNatureANNIKLeftPalmFKTuplesNormalizationBounds = ValterNatureANNIKLeftPalmFKTuplesNormalizationBounds.substr(0, ValterNatureANNIKLeftPalmFKTuplesNormalizationBounds.length - 2);
            ValterNatureANNIKLeftPalmFKTuplesNormalizationBounds += '\n}';
            console.log(ValterNatureANNIKLeftPalmFKTuplesNormalizationBounds);
        });
    }

    prepareValterLeftPalmFKTuples() {
        return new Promise((resolve, reject) => {
            this.vLab.VLabsRESTClientManager.ValterLeftPalmIKService.getAllLeftPalmFKTuplesNormalized(this.Valter.ValterIK.leftPalmIKDataThrottlingSigma)
            .then(leftPalmFKNormalizedTuples => {
                resolve(leftPalmFKNormalizedTuples);
            });
        });
    }

    prepareValterLeftPalmIKTrainingData(leftPalmFKTuples) {
        let valterLeftPalmIKTrainingData = {};
        return new Promise((resolve, reject) => {
            /**
             * Input tensor built from ValterLeftPalmFKTuple.leftPalmTargetPosition records
             * 
             * inputTensorValues: [ValterLeftPalmFKTuple.leftPalmTargetPosition.x, ValterLeftPalmFKTuple.leftPalmTargetPosition.y, ValterLeftPalmFKTuple.leftPalmTargetPosition.z, ...]
             * inputTensorShape: [leftPalmFKTuples.length, 3]
             */
            let inputTensorValues = [];
            /**
             * Output tensor built from 
             *      ValterLeftPalmFKTuple.shoulderLeftLinkValue
             *      ValterLeftPalmFKTuple.limbLeftLinkValue
             *      ValterLeftPalmFKTuple.armLeftLinkValue
             *      ValterLeftPalmFKTuple.forearmRollLeftLinkValue
             * 
             * outputTensorValues: [ValterLeftPalmFKTuple.shoulderLeftLinkValue, ValterLeftPalmFKTuple.limbLeftLinkValue, ValterLeftPalmFKTuple.armLeftLinkValue, ValterLeftPalmFKTuple.forearmRollLeftLinkValue, ...]
             * outputTensorShape: [leftPalmFKTuples.length, 4]
             */
            let outputTensorValues = [];

            /**
             * Pushing values to inputTensorValues and outputTensorValues
             */
            leftPalmFKTuples.forEach(leftPalmFKTuple => {
                inputTensorValues.push(leftPalmFKTuple.leftPalmTargetPosition.x, leftPalmFKTuple.leftPalmTargetPosition.y, leftPalmFKTuple.leftPalmTargetPosition.z);
                outputTensorValues.push(leftPalmFKTuple.shoulderLeftLinkValue, leftPalmFKTuple.limbLeftLinkValue, leftPalmFKTuple.armLeftLinkValue, leftPalmFKTuple.forearmRollLeftLinkValue);
            });

            valterLeftPalmIKTrainingData.inputTensorValues  = inputTensorValues;
            valterLeftPalmIKTrainingData.inputTensorShape  = [leftPalmFKTuples.length, 3];

            valterLeftPalmIKTrainingData.outputTensorValues = outputTensorValues;
            valterLeftPalmIKTrainingData.outputTensorShape = [leftPalmFKTuples.length, 4];

            resolve(valterLeftPalmIKTrainingData);
        });
    }

    prepareValterLeftPalmFKtoIKSolving() {
        return new Promise((resolve, reject) => {
            this.prepareValterLeftPalmFKTuples().then((leftPalmFKTuples) => {
                this.prepareValterLeftPalmIKTrainingData(leftPalmFKTuples).then((valterLeftPalmIKTrainingData) => {
                    const inputTensor = tf.tensor(valterLeftPalmIKTrainingData.inputTensorValues, valterLeftPalmIKTrainingData.inputTensorShape);
                    const outpuTensor = tf.tensor(valterLeftPalmIKTrainingData.outputTensorValues, valterLeftPalmIKTrainingData.outputTensorShape);

                    const optimizer = tf.train.sgd(0.1);
                    const loss = 'meanSquaredError';

                    tf.loadLayersModel('localstorage://valter-left-palm-ik-model')
                    .then((savedModel) => {
                        const model = savedModel;

                        // Specify the loss type and optimizer for training.
                        model.compile({loss: loss, optimizer: optimizer, metrics: ['accuracy']});

                        const valterLeftPalmFKtoIKSolver = {
                            model: model,
                            inputTensor: inputTensor,
                            outpuTensor: outpuTensor
                        };
                        resolve(valterLeftPalmFKtoIKSolver);
                    })
                    .catch(error => {
                        // A sequential model is a container which you can add layers to.
                        const model = tf.sequential();
                        model.add(tf.layers.dense({inputShape: [valterLeftPalmIKTrainingData.inputTensorShape[1]], units: 32, activation: 'elu'}));
                        model.add(tf.layers.dense({units: 4, activation: 'tanh'}));

                        // Specify the loss type and optimizer for training.
                        model.compile({loss: loss, optimizer: optimizer, metrics: ['accuracy']});

                        const valterLeftPalmFKtoIKSolver = {
                            model: model,
                            inputTensor: inputTensor,
                            outpuTensor: outpuTensor
                        };
                        resolve(valterLeftPalmFKtoIKSolver);
                    });
                });
            });
        });
    }

    fitAndSaveLeftPalmTargetIKModel() {
        tf.setBackend('webgl');
        console.log('TF Backend:', tf.getBackend());
        this.prepareValterLeftPalmFKtoIKSolving().then((valterLeftPalmFKtoIKSolver) => {
            this.valterLeftPalmFKtoIKSolver = valterLeftPalmFKtoIKSolver;

            this.vLab.renderPaused = true;

            // Train the model.
            console.log(this.valterLeftPalmFKtoIKSolver);
            console.log('Training ValterLeftPalmFKtoIKSolver Model ...');
            // We'll keep a buffer of loss and accuracy values over time.
            let trainBatchCount = 0;
            let trainEpochCount = 0;
            let trainEpochs = 2000;
            this.valterLeftPalmFKtoIKSolver.model.fit(
                this.valterLeftPalmFKtoIKSolver.inputTensor, 
                this.valterLeftPalmFKtoIKSolver.outpuTensor, 
                {
                    epochs: trainEpochs,
                    // batchSize: 500,
                    shuffle: true,
                    //validationData: [this.valterLeftPalmFKtoIKSolver.inputTensor, this.valterLeftPalmFKtoIKSolver.outpuTensor],
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

                this.valterLeftPalmFKtoIKSolver.model.save('localstorage://valter-left-palm-ik-model').then(() => {
                    tf.loadLayersModel('localstorage://valter-left-palm-ik-model').then((model) => {
                        this.valterLeftPalmFKtoIKSolver.model = model;

                        let leftPalmNormalizationBounds = this.Valter.nature.ANNIK.leftPalmFKTuplesNormalizationBounds;

                        /**
                         * db.valter_left_palm_fk_tuples.find().sort({ $natural: 1 }).limit(1).pretty()
                         */
                        let input1 = [0.023, 0.189, 0.343];
                        input1[0] = ANNUtils.normalizeNegPos(input1[0], leftPalmNormalizationBounds.leftPalmTargetPositionXMin, leftPalmNormalizationBounds.leftPalmTargetPositionXMax);
                        input1[1] = ANNUtils.normalizeNegPos(input1[1], leftPalmNormalizationBounds.leftPalmTargetPositionYMin, leftPalmNormalizationBounds.leftPalmTargetPositionYMax);
                        input1[2] = ANNUtils.normalizeNegPos(input1[2], leftPalmNormalizationBounds.leftPalmTargetPositionZMin, leftPalmNormalizationBounds.leftPalmTargetPositionZMax);
                        const prediction1 = this.valterLeftPalmFKtoIKSolver.model.predict(tf.tensor(input1, [1, 3]));
                        let output1Preditcion = prediction1.dataSync();
                        let output1 = [
                            ANNUtils.deNormalizeNegPos(output1Preditcion[0], leftPalmNormalizationBounds.shoulderLeftLinkValueMin, leftPalmNormalizationBounds.shoulderLeftLinkValueMax),
                            ANNUtils.deNormalizeNegPos(output1Preditcion[0], leftPalmNormalizationBounds.limbLeftLinkValueMin, leftPalmNormalizationBounds.limbLeftLinkValueMax),
                            ANNUtils.deNormalizeNegPos(output1Preditcion[0], leftPalmNormalizationBounds.armLeftLinkValueMin, leftPalmNormalizationBounds.armLeftLinkValueMax),
                            ANNUtils.deNormalizeNegPos(output1Preditcion[0], leftPalmNormalizationBounds.forearmRollLeftLinkValueMin, leftPalmNormalizationBounds.forearmRollLeftLinkValueMax),
                        ];
                        console.log('FK Tuple [0.023, 0.189, 0.343] -> [-1.05, -1.48, 0.0, -0.65]');
                        console.log('shoulderLeftLinkValue, limbLeftLinkValue, armLeftLinkValue, forearmRollLeftLinkValue prediction: [' + output1[0].toFixed(3) + ', ' + output1[1].toFixed(3) + ', ' + output1[2].toFixed(3) + ', ' + output1[3].toFixed(3) + ' ]');

                        /**
                         * db.valter_left_palm_fk_tuples.find().sort({ $natural: -1 }).limit(1).pretty()
                         */
                        let input2 = [0.973, -0.322, -0.144];
                        input2[0] = ANNUtils.normalizeNegPos(input2[0], leftPalmNormalizationBounds.leftPalmTargetPositionXMin, leftPalmNormalizationBounds.leftPalmTargetPositionXMax);
                        input2[1] = ANNUtils.normalizeNegPos(input2[1], leftPalmNormalizationBounds.leftPalmTargetPositionYMin, leftPalmNormalizationBounds.leftPalmTargetPositionYMax);
                        input2[2] = ANNUtils.normalizeNegPos(input2[2], leftPalmNormalizationBounds.leftPalmTargetPositionZMin, leftPalmNormalizationBounds.leftPalmTargetPositionZMax);
                        const prediction2 = this.valterLeftPalmFKtoIKSolver.model.predict(tf.tensor(input2, [1, 3]));
                        let output2Preditcion = prediction2.dataSync();
                        let output2 = [
                            ANNUtils.deNormalizeNegPos(output2Preditcion[0], leftPalmNormalizationBounds.shoulderLeftLinkValueMin, leftPalmNormalizationBounds.shoulderLeftLinkValueMax),
                            ANNUtils.deNormalizeNegPos(output2Preditcion[0], leftPalmNormalizationBounds.limbLeftLinkValueMin, leftPalmNormalizationBounds.limbLeftLinkValueMax),
                            ANNUtils.deNormalizeNegPos(output2Preditcion[0], leftPalmNormalizationBounds.armLeftLinkValueMin, leftPalmNormalizationBounds.armLeftLinkValueMax),
                            ANNUtils.deNormalizeNegPos(output2Preditcion[0], leftPalmNormalizationBounds.forearmRollLeftLinkValueMin, leftPalmNormalizationBounds.forearmRollLeftLinkValueMax),
                        ];
                        console.log('FK Tuple [0.973, -0.322, -0.144] -> [0.05, 1.12, 1.4, 1.15]');
                        console.log('shoulderLeftLinkValue, limbLeftLinkValue, armLeftLinkValue, forearmRollLeftLinkValue prediction: [' + output2[0].toFixed(3) + ', ' + output2[1].toFixed(3) + ', ' + output2[2].toFixed(3) + ', ' + output2[3].toFixed(3) + ' ]');
                    });
                });
            });
        });
    }

    saveValterLeftPalmTargetIKModelToLocalFile() {
        if (this.Valter.nature.ANNIK.leftPalmANNIK) {
            tf.loadLayersModel('localstorage://valter-left-palm-ik-model')
            .then((model) => {
                model.save('downloads://valter-left-palm-ik-model');
            })
            .catch(error => {
                console.error(error.message);
            });
        }
    }
}
export default ValterLeftPalmIKDev;