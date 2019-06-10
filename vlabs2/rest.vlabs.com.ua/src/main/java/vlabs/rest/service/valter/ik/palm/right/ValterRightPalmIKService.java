package vlabs.rest.service.valter.ik.palm.right;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vlabs.rest.model.three.Vector3;
import vlabs.rest.model.valter.ik.head.ValterHeadFKTuple;
import vlabs.rest.model.valter.ik.head.ValterHeadFKTuplesNormalizationBounds;
import vlabs.rest.model.valter.ik.palm.right.ValterRightPalmFKTuple;
import vlabs.rest.model.valter.ik.palm.right.ValterRightPalmFKTuplesNormalizationBounds;
import vlabs.rest.repository.mongo.valter.ik.palm.right.ValterRightPalmFKTupleRepository;
import vlabs.rest.utils.ann.ANNUtils;

@Service
public class ValterRightPalmIKService {

    @Autowired
    ValterRightPalmFKTupleRepository valterRightPalmFKTupleRepository;

    public Mono<ValterRightPalmFKTuple> saveValterRightPalmFKTuple(ValterRightPalmFKTuple valterRightPalmFKTuple) {
        return valterRightPalmFKTupleRepository.save(valterRightPalmFKTuple);
    }

    public Flux<ValterRightPalmFKTuple> getValterRightPalmFKTuple(Vector3 rightPalmTargetPosition) {
        double sigma = 0.1;
        return (Flux<ValterRightPalmFKTuple>) valterRightPalmFKTupleRepository.findByRightPalmTargetXYZMinMax(
                rightPalmTargetPosition.getX() - sigma,
                rightPalmTargetPosition.getX() + sigma,
                rightPalmTargetPosition.getY() - sigma,
                rightPalmTargetPosition.getY() + sigma,
                rightPalmTargetPosition.getZ() - sigma,
                rightPalmTargetPosition.getZ() + sigma);
    }

    public Flux<ValterRightPalmFKTuple> getAllValterRightPalmFKTuples() {
        return valterRightPalmFKTupleRepository.findAll();
    }

    public Flux<ValterRightPalmFKTuple> getAllValterRightPalmFKTuplesNormalized() {
        ValterRightPalmFKTuplesNormalizationBounds valterRightPalmFKTuplesNormalizationBounds = new ValterRightPalmFKTuplesNormalizationBounds();

        return getValterRightPalmFKTuplesNormalizationBounds()
                .doOnSuccess(rightPalmFKTuplesNormalizationBounds -> {
                    valterRightPalmFKTuplesNormalizationBounds.setRightPalmTargetPositionXMin(rightPalmFKTuplesNormalizationBounds.getRightPalmTargetPositionXMin());
                    valterRightPalmFKTuplesNormalizationBounds.setRightPalmTargetPositionXMax(rightPalmFKTuplesNormalizationBounds.getRightPalmTargetPositionXMax());
                    valterRightPalmFKTuplesNormalizationBounds.setRightPalmTargetPositionYMin(rightPalmFKTuplesNormalizationBounds.getRightPalmTargetPositionYMin());
                    valterRightPalmFKTuplesNormalizationBounds.setRightPalmTargetPositionYMax(rightPalmFKTuplesNormalizationBounds.getRightPalmTargetPositionYMax());
                    valterRightPalmFKTuplesNormalizationBounds.setRightPalmTargetPositionZMin(rightPalmFKTuplesNormalizationBounds.getRightPalmTargetPositionZMin());
                    valterRightPalmFKTuplesNormalizationBounds.setRightPalmTargetPositionZMax(rightPalmFKTuplesNormalizationBounds.getRightPalmTargetPositionZMax());
                    valterRightPalmFKTuplesNormalizationBounds.setShoulderRightLinkValueMin(rightPalmFKTuplesNormalizationBounds.getShoulderRightLinkValueMin());
                    valterRightPalmFKTuplesNormalizationBounds.setShoulderRightLinkValueMax(rightPalmFKTuplesNormalizationBounds.getShoulderRightLinkValueMax());
                    valterRightPalmFKTuplesNormalizationBounds.setLimbRightLinkValueMin(rightPalmFKTuplesNormalizationBounds.getLimbRightLinkValueMin());
                    valterRightPalmFKTuplesNormalizationBounds.setLimbRightLinkValueMax(rightPalmFKTuplesNormalizationBounds.getLimbRightLinkValueMax());
                    valterRightPalmFKTuplesNormalizationBounds.setArmRightLinkValueMin(rightPalmFKTuplesNormalizationBounds.getArmRightLinkValueMin());
                    valterRightPalmFKTuplesNormalizationBounds.setArmRightLinkValueMax(rightPalmFKTuplesNormalizationBounds.getArmRightLinkValueMax());
                    valterRightPalmFKTuplesNormalizationBounds.setForearmRollRightLinkValueMin(rightPalmFKTuplesNormalizationBounds.getForearmRollRightLinkValueMin());
                    valterRightPalmFKTuplesNormalizationBounds.setForearmRollRightLinkValueMax(rightPalmFKTuplesNormalizationBounds.getForearmRollRightLinkValueMax());
                })
                .thenMany(getAllValterRightPalmFKTuples().map(valterRightPalmFKTuple -> {
                    double nX = ANNUtils.normalizeNegPos(valterRightPalmFKTuple.getRightPalmTargetPosition().getX(), valterRightPalmFKTuplesNormalizationBounds.getRightPalmTargetPositionXMin(), valterRightPalmFKTuplesNormalizationBounds.getRightPalmTargetPositionXMax());
                    double nY = ANNUtils.normalizeNegPos(valterRightPalmFKTuple.getRightPalmTargetPosition().getY(), valterRightPalmFKTuplesNormalizationBounds.getRightPalmTargetPositionYMin(), valterRightPalmFKTuplesNormalizationBounds.getRightPalmTargetPositionYMax());
                    double nZ = ANNUtils.normalizeNegPos(valterRightPalmFKTuple.getRightPalmTargetPosition().getZ(), valterRightPalmFKTuplesNormalizationBounds.getRightPalmTargetPositionZMin(), valterRightPalmFKTuplesNormalizationBounds.getRightPalmTargetPositionZMax());
                    double nShoulderRightLinkValue = ANNUtils.normalizeNegPos(valterRightPalmFKTuple.getShoulderRightLinkValue(), valterRightPalmFKTuplesNormalizationBounds.getShoulderRightLinkValueMin(), valterRightPalmFKTuplesNormalizationBounds.getShoulderRightLinkValueMax());
                    double nLimbRightLinkValue = ANNUtils.normalizeNegPos(valterRightPalmFKTuple.getLimbRightLinkValue(), valterRightPalmFKTuplesNormalizationBounds.getLimbRightLinkValueMin(), valterRightPalmFKTuplesNormalizationBounds.getLimbRightLinkValueMax());
                    double nArmRightLinkValue = ANNUtils.normalizeNegPos(valterRightPalmFKTuple.getArmRightLinkValue(), valterRightPalmFKTuplesNormalizationBounds.getArmRightLinkValueMin(), valterRightPalmFKTuplesNormalizationBounds.getArmRightLinkValueMax());
                    double nForearmRollRightLinkValue = ANNUtils.normalizeNegPos(valterRightPalmFKTuple.getForearmRollRightLinkValue(), valterRightPalmFKTuplesNormalizationBounds.getForearmRollRightLinkValueMin(), valterRightPalmFKTuplesNormalizationBounds.getForearmRollRightLinkValueMax());

                    valterRightPalmFKTuple.setRightPalmTargetPosition(new Vector3(nX, nY, nZ));
                    valterRightPalmFKTuple.setShoulderRightLinkValue(nShoulderRightLinkValue);
                    valterRightPalmFKTuple.setLimbRightLinkValue(nLimbRightLinkValue);
                    valterRightPalmFKTuple.setArmRightLinkValue(nArmRightLinkValue);
                    valterRightPalmFKTuple.setForearmRollRightLinkValue(nForearmRollRightLinkValue);

                    return valterRightPalmFKTuple;
                }));
    }

    public Mono<ValterRightPalmFKTuplesNormalizationBounds> getValterRightPalmFKTuplesNormalizationBounds() {
        ValterRightPalmFKTuplesNormalizationBounds valterRightPalmFKTuplesNormalizationBounds = new ValterRightPalmFKTuplesNormalizationBounds();

        Mono<ValterRightPalmFKTuple> rightPalmTargetPositionXMinRequest = valterRightPalmFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "rightPalmTargetPosition.x"));
        Mono<ValterRightPalmFKTuple> rightPalmTargetPositionXMaxRequest = valterRightPalmFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "rightPalmTargetPosition.x"));
        Mono<ValterRightPalmFKTuple> rightPalmTargetPositionYMinRequest = valterRightPalmFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "rightPalmTargetPosition.y"));
        Mono<ValterRightPalmFKTuple> rightPalmTargetPositionYMaxRequest = valterRightPalmFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "rightPalmTargetPosition.y"));
        Mono<ValterRightPalmFKTuple> rightPalmTargetPositionZMinRequest = valterRightPalmFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "rightPalmTargetPosition.z"));
        Mono<ValterRightPalmFKTuple> rightPalmTargetPositionZMaxRequest = valterRightPalmFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "rightPalmTargetPosition.z"));
        Mono<ValterRightPalmFKTuple> shoulderRightLinkValueMinRequest = valterRightPalmFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "shoulderRightLinkValue"));
        Mono<ValterRightPalmFKTuple> shoulderRightLinkValueMaxRequest = valterRightPalmFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "shoulderRightLinkValue"));
        Mono<ValterRightPalmFKTuple> limbRightLinkValueMinRequest = valterRightPalmFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "limbRightLinkValue"));
        Mono<ValterRightPalmFKTuple> limbRightLinkValueMaxRequest = valterRightPalmFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "limbRightLinkValue"));
        Mono<ValterRightPalmFKTuple> armRightLinkValueMinRequest = valterRightPalmFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "armRightLinkValue"));
        Mono<ValterRightPalmFKTuple> armRightLinkValueMaxRequest = valterRightPalmFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "armRightLinkValue"));
        Mono<ValterRightPalmFKTuple> forearmRollRightLinkValueMinRequest = valterRightPalmFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "forearmRollRightLinkValue"));
        Mono<ValterRightPalmFKTuple> forearmRollRightLinkValueMaxRequest = valterRightPalmFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "forearmRollRightLinkValue"));

        return
                rightPalmTargetPositionXMinRequest
                .doOnSuccess(tuple -> {
                    valterRightPalmFKTuplesNormalizationBounds.setRightPalmTargetPositionXMin(tuple.getRightPalmTargetPosition().getX());
                })
                .then(rightPalmTargetPositionXMaxRequest) 
                .doOnSuccess(tuple -> {
                    valterRightPalmFKTuplesNormalizationBounds.setRightPalmTargetPositionXMax(tuple.getRightPalmTargetPosition().getX());
                })
                .then(rightPalmTargetPositionYMinRequest) 
                .doOnSuccess(tuple -> {
                    valterRightPalmFKTuplesNormalizationBounds.setRightPalmTargetPositionYMin(tuple.getRightPalmTargetPosition().getY());
                })
                .then(rightPalmTargetPositionYMaxRequest) 
                .doOnSuccess(tuple -> {
                    valterRightPalmFKTuplesNormalizationBounds.setRightPalmTargetPositionYMax(tuple.getRightPalmTargetPosition().getY());
                })
                .then(rightPalmTargetPositionZMinRequest) 
                .doOnSuccess(tuple -> {
                    valterRightPalmFKTuplesNormalizationBounds.setRightPalmTargetPositionZMin(tuple.getRightPalmTargetPosition().getZ());
                })
                .then(rightPalmTargetPositionZMaxRequest) 
                .doOnSuccess(tuple -> {
                    valterRightPalmFKTuplesNormalizationBounds.setRightPalmTargetPositionZMax(tuple.getRightPalmTargetPosition().getZ());
                })
                .then(shoulderRightLinkValueMinRequest) 
                .doOnSuccess(tuple -> {
                    valterRightPalmFKTuplesNormalizationBounds.setShoulderRightLinkValueMin(tuple.getShoulderRightLinkValue());
                })
                .then(shoulderRightLinkValueMaxRequest) 
                .doOnSuccess(tuple -> {
                    valterRightPalmFKTuplesNormalizationBounds.setShoulderRightLinkValueMax(tuple.getShoulderRightLinkValue());
                })
                .then(limbRightLinkValueMinRequest) 
                .doOnSuccess(tuple -> {
                    valterRightPalmFKTuplesNormalizationBounds.setLimbRightLinkValueMin(tuple.getLimbRightLinkValue());
                })
                .then(limbRightLinkValueMaxRequest) 
                .doOnSuccess(tuple -> {
                    valterRightPalmFKTuplesNormalizationBounds.setLimbRightLinkValueMax(tuple.getLimbRightLinkValue());
                })
                .then(armRightLinkValueMinRequest) 
                .doOnSuccess(tuple -> {
                    valterRightPalmFKTuplesNormalizationBounds.setArmRightLinkValueMin(tuple.getArmRightLinkValue());
                })
                .then(armRightLinkValueMaxRequest) 
                .doOnSuccess(tuple -> {
                    valterRightPalmFKTuplesNormalizationBounds.setArmRightLinkValueMax(tuple.getArmRightLinkValue());
                })
                .then(forearmRollRightLinkValueMinRequest) 
                .doOnSuccess(tuple -> {
                    valterRightPalmFKTuplesNormalizationBounds.setForearmRollRightLinkValueMin(tuple.getForearmRollRightLinkValue());
                })
                .then(forearmRollRightLinkValueMaxRequest) 
                .doOnSuccess(tuple -> {
                    valterRightPalmFKTuplesNormalizationBounds.setForearmRollRightLinkValueMax(tuple.getForearmRollRightLinkValue());
                })
                .map(tuple -> {
                    return valterRightPalmFKTuplesNormalizationBounds;
                });
    }
}
