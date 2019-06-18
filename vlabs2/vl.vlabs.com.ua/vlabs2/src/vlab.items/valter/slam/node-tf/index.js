const tf = require('@tensorflow/tfjs-node-gpu');
const argparse = require('argparse');

/**
 * Command line arguments parser
 */
const parser = new argparse.ArgumentParser({
  description: 'TensorFlow.js-Node Valter SLAM.',
  addHelp: true
});
parser.addArgument('--epochs', {
  type: 'int',
  defaultValue: 20,
  help: 'Number of epochs to train the model for.'
});
const args = parser.parseArgs();

function build_model(args) {
    const model = tf.sequential();
    model.add(tf.layers.conv2d({filters: 24, kernelSize: [5, 5], activation: 'elu'}));
}

