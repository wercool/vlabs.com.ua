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

        // this.Valter.ValterLinks.shoulderRightLink.step = 0.1;

        this.Valter.setShoulderRightLink(this.Valter.ValterLinks.shoulderRightLink.min);

        this.setValterShoulderRightLinkValue();
    }

    setValterShoulderRightLinkValue() {
        this.Valter.setShoulderRightLink(this.Valter.ValterLinks.shoulderRightLink.value + this.Valter.ValterLinks.shoulderRightLink.step);

        setTimeout(this.setValterShoulderRightLinkValue, 100);
    }

    setValterLimbRightLinkValue() {

    }

    setValterArmRightLinkValue() {

    }

    setValterForearmRollRightLinkValue() {

    }

    persistRightPalmTargetPosition() {

    }
}
export default ValterRightPalmIKDev;