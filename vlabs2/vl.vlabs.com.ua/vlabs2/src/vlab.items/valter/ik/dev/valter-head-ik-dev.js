import * as tf from '@tensorflow/tfjs';
import * as ANNUtils from '../../../../vlab.fwk/utils/ann.utils';
import ValterHeadFKTuple from '../model/valter-head-fk-tuple';

/**
 * Valter Head IK dev class.
 * @class
 * @classdesc Valter The Robot Head IK methods aggregation.
 */
class ValterHeadIKDev {
    constructor(Valter) {
        /**
         * Valter instance
         */
        this.Valter = Valter;
        /**
         * Valter.vLab VLab Instance
         */
        this.vLab = this.Valter.vLab;
    }

    /**
     * 
     * Head FK tuples 
     * 
     */
    getValterHeadFKTuples() {
        if (this.Valter.nature.devHelpers.showKinectHeadDirection == true) {

            this.setValterHeadYaw = this.setValterHeadYaw.bind(this);
            this.setValterHeadTilt = this.setValterHeadTilt.bind(this);
            this.setValterHeadDistance = this.setValterHeadDistance.bind(this);
            this.persistHeadTargetPosition = this.persistHeadTargetPosition.bind(this);

            this.Valter.ValterLinks.headYawLink.step = 0.1;
            this.Valter.ValterLinks.headTiltLink.step = 0.1;
            this.headDirectionTargetDistance_step = 0.25;

            this.Valter.setHeadYawLink(this.Valter.ValterLinks.headYawLink.min);
            this.Valter.setHeadTiltLink(this.Valter.ValterLinks.headTiltLink.min);

            this.setValterHeadYaw();
        } else {
            console.error('To get Valter Head FK tuples set Valter.nature.devHelpers.showKinectHeadDirection = true');
        }
    }

    setValterHeadYaw() {
        if (this.Valter.ValterLinks.headYawLink.value < this.Valter.ValterLinks.headYawLink.max + this.Valter.ValterLinks.headYawLink.step) {
            this.setValterHeadTilt();
        }
    }

    setValterHeadTilt() {
        if (this.Valter.ValterLinks.headTiltLink.value < this.Valter.ValterLinks.headTiltLink.max + this.Valter.ValterLinks.headTiltLink.step) {
            this.setValterHeadDistance();
        } else {
            this.Valter.ValterLinks.headTiltLink.value = this.Valter.ValterLinks.headTiltLink.min;

            this.Valter.ValterLinks.headYawLink.value += this.Valter.ValterLinks.headYawLink.step;
            this.setValterHeadYaw();
            this.Valter.setHeadYawLink(this.Valter.ValterLinks.headYawLink.value);
            this.Valter.ValterIK.updateHeadTargetDirectionFromHeadYawLinkOrigin();
        }
    }

    setValterHeadDistance() {
        if (this.Valter.ValterIK.headDirectionTargetDistance < 3.0) {
            this.persistHeadTargetPosition();
        } else {
            this.Valter.ValterIK.headDirectionTargetDistance = 0.4;
            this.Valter.ValterLinks.headTiltLink.value += this.Valter.ValterLinks.headTiltLink.step;
            this.setValterHeadTilt();
            this.Valter.setHeadTiltLink(this.Valter.ValterLinks.headTiltLink.value);
            this.Valter.ValterIK.updateHeadTargetDirectionFromHeadYawLinkOrigin();
        }
    }
    persistHeadTargetPosition() {
        this.Valter.ValterIK.updateHeadTargetDirectionFromHeadYawLinkOrigin();

        let headFKTuple = new ValterHeadFKTuple();
        headFKTuple.headTargetPosition.x = this.Valter.ValterIK.headYawLinkHeadTargetLocalPos.x;
        headFKTuple.headTargetPosition.y = this.Valter.ValterIK.headYawLinkHeadTargetLocalPos.y;
        headFKTuple.headTargetPosition.z = this.Valter.ValterIK.headYawLinkHeadTargetLocalPos.z;
        headFKTuple.headYawLinkValue = parseFloat(this.Valter.ValterLinks.headYawLink.value.toFixed(3));
        headFKTuple.headTiltLinkValue = parseFloat(this.Valter.ValterLinks.headTiltLink.value.toFixed(3));

        this.vLab.VLabsRESTClientManager.ValterHeadIKService.saveHeadFKTuple(headFKTuple)
        .then(result => {
            console.log('headYaw = ' + this.Valter.ValterLinks.headYawLink.value.toFixed(3), 'headTilt = ' + this.Valter.ValterLinks.headTiltLink.value.toFixed(3), this.Valter.ValterIK.headYawLinkHeadTargetLocalPos, this.Valter.ValterIK.headDirectionTargetDistance.toFixed(3));

            this.Valter.ValterIK.headDirectionTargetDistance += this.headDirectionTargetDistance_step;
            this.setValterHeadDistance();
        });
    }

    /**
     * 
     * Head IK solving with TFjs
     * 
     */

    printHeadFKTuplesNormalizationBounds() {
        this.vLab.VLabsRESTClientManager.ValterHeadIKService.getHeadFKTuplesNormalizationBounds()
        .then(headFKTuplesNormalizationBounds => {
            let ValterNatureANNIKHeadFKTuplesNormalizationBounds = '"headFKTuplesNormalizationBounds": {\n';
            Object.keys(headFKTuplesNormalizationBounds).forEach((key) => {
                ValterNatureANNIKHeadFKTuplesNormalizationBounds += '"' + key + '": ' + headFKTuplesNormalizationBounds[key] + ',\n';
            });
            ValterNatureANNIKHeadFKTuplesNormalizationBounds = ValterNatureANNIKHeadFKTuplesNormalizationBounds.substr(0, ValterNatureANNIKHeadFKTuplesNormalizationBounds.length - 2);
            ValterNatureANNIKHeadFKTuplesNormalizationBounds += '\n}';
            console.log(ValterNatureANNIKHeadFKTuplesNormalizationBounds);
        });
    }

    prepareValterHeadFKTuples() {
        return new Promise((resolve, reject) => {
            this.vLab.VLabsRESTClientManager.ValterHeadIKService.getAllHeadFKTuplesNormalized()
            .then(headFKNormalizedTuples => {
                resolve(headFKNormalizedTuples);
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

    prepareValterHeadFKtoIKSolving() {
        return new Promise((resolve, reject) => {
            this.prepareValterHeadFKTuples().then((headFKTuples) => {
                this.prepareValterHeadIKTrainingData(headFKTuples).then((valterHeadIKTrainingData) => {
                    const inputTensor = tf.tensor(valterHeadIKTrainingData.inputTensorValues, valterHeadIKTrainingData.inputTensorShape);
                    const outpuTensor = tf.tensor(valterHeadIKTrainingData.outputTensorValues, valterHeadIKTrainingData.outputTensorShape);

                    const optimizer = tf.train.sgd(0.1);
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
                        model.add(tf.layers.dense({inputShape: [valterHeadIKTrainingData.inputTensorShape[1]], units: 12, activation: 'elu'}));
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

    fitAndSaveHeadTargetIKModel() {
        tf.setBackend('webgl');
        console.log('TF Backend:', tf.getBackend());
        this.prepareValterHeadFKtoIKSolving().then((valterHeadFKtoIKSolver) => {
            this.valterHeadFKtoIKSolver = valterHeadFKtoIKSolver;

            this.vLab.renderPaused = true;

            // Train the model.
            console.log(this.valterHeadFKtoIKSolver);
            console.log('Training ValterHeadFKtoIKSolver Model ...');
            // We'll keep a buffer of loss and accuracy values over time.
            let trainBatchCount = 0;
            let trainEpochCount = 0;
            let trainEpochs = 1000;
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

                this.vLab.renderPaused = false;

                console.log(result);

                this.valterHeadFKtoIKSolver.model.save('localstorage://valter-head-ik-model').then(() => {

                    tf.loadLayersModel('localstorage://valter-head-ik-model').then((model) => {
                        this.valterHeadFKtoIKSolver.model = model;

                        let headNormalizationBounds = this.Valter.nature.ANNIK.headFKTuplesNormalizationBounds;

                        /**
                         * db.valter_head_fk_tuples.find().sort({ $natural: 1 }).limit(1).pretty()
                         */
                        let input1 = [-0.366, -0.284, 0.099];
                        input1[0] = ANNUtils.normalizeNegPos(input1[0], headNormalizationBounds.headTargetPositionXMin, headNormalizationBounds.headTargetPositionXMax);
                        input1[1] = ANNUtils.normalizeNegPos(input1[1], headNormalizationBounds.headTargetPositionYMin, headNormalizationBounds.headTargetPositionYMax);
                        input1[2] = ANNUtils.normalizeNegPos(input1[2], headNormalizationBounds.headTargetPositionZMin, headNormalizationBounds.headTargetPositionZMax);
                        const prediction1 = this.valterHeadFKtoIKSolver.model.predict(tf.tensor(input1, [1, 3]));
                        let output1Preditcion = prediction1.dataSync();
                        let output1 = [
                            ANNUtils.deNormalizeNegPos(output1Preditcion[0], headNormalizationBounds.headYawLinkValueMin, headNormalizationBounds.headYawLinkValueMax),
                            ANNUtils.deNormalizeNegPos(output1Preditcion[1], headNormalizationBounds.headTiltLinkValueMin, headNormalizationBounds.headTiltLinkValueMax),
                        ];
                        console.log('FK Tuple [-0.366, -0.284, 0.099] -> [-1.350, -1.000]');
                        console.log('HeadYaw, HeadTils prediction: [' + output1[0].toFixed(3) + ', ' + output1[1].toFixed(3) + ' ]');
                        /**
                         * db.valter_head_fk_tuples.find().sort({ $natural: -1 }).limit(1).pretty()
                         */
                        let input2 = [2.754, -0.394, 0.898];
                        input2[0] = ANNUtils.normalizeNegPos(input2[0], headNormalizationBounds.headTargetPositionXMin, headNormalizationBounds.headTargetPositionXMax);
                        input2[1] = ANNUtils.normalizeNegPos(input2[1], headNormalizationBounds.headTargetPositionYMin, headNormalizationBounds.headTargetPositionYMax);
                        input2[2] = ANNUtils.normalizeNegPos(input2[2], headNormalizationBounds.headTargetPositionZMin, headNormalizationBounds.headTargetPositionZMax);
                        const prediction2 = this.valterHeadFKtoIKSolver.model.predict(tf.tensor(input2, [1, 3]));
                        let output2Preditcion = prediction2.dataSync();
                        let output2 = [
                            ANNUtils.deNormalizeNegPos(output2Preditcion[0], headNormalizationBounds.headYawLinkValueMin, headNormalizationBounds.headYawLinkValueMax),
                            ANNUtils.deNormalizeNegPos(output2Preditcion[1], headNormalizationBounds.headTiltLinkValueMin, headNormalizationBounds.headTiltLinkValueMax),
                        ];
                        console.log('FK Tuple [2.754, -0.394, 0.898] -> [1.350, 0.1]');
                        console.log('HeadYaw, HeadTils prediction: [' + output2[0].toFixed(3) + ', ' + output2[1].toFixed(3) + ' ]');
                    });
                });
            });
        });
    }

    saveValterHeadIKModelToLocalFile() {
        if (this.Valter.nature.ANNIK.headANNIK) {
            tf.loadLayersModel('localstorage://valter-head-ik-model')
            .then((model) => {
                model.save('downloads://valter-head-ik-model');
            })
            .catch(error => {
                console.error(error.message);
            });
        }
    }
}
export default ValterHeadIKDev;