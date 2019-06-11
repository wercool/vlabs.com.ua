package vlabs.rest.service.valter.ik.palm.left;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vlabs.rest.model.three.Vector3;
import vlabs.rest.model.valter.ik.palm.left.ValterLeftPalmFKTuple;
import vlabs.rest.model.valter.ik.palm.left.ValterLeftPalmFKTuplesNormalizationBounds;
import vlabs.rest.repository.mongo.valter.ik.palm.left.ValterLeftPalmFKTupleRepository;
import vlabs.rest.utils.ann.ANNUtils;

@Service
public class ValterLeftPalmIKService {

    private static final Logger log = LoggerFactory.getLogger(ValterLeftPalmIKService.class);

    @Autowired
    ValterLeftPalmFKTupleRepository valterLeftPalmFKTupleRepository;

    public Mono<ValterLeftPalmFKTuple> saveValterLeftPalmFKTuple(ValterLeftPalmFKTuple valterLeftPalmFKTuple) {
        return valterLeftPalmFKTupleRepository.save(valterLeftPalmFKTuple);
    }

    public Flux<ValterLeftPalmFKTuple> getValterLeftPalmFKTuple(Vector3 leftPalmTargetPosition) {
        double sigma = 0.1;
        return (Flux<ValterLeftPalmFKTuple>) valterLeftPalmFKTupleRepository.findByLeftPalmTargetXYZMinMax(
                leftPalmTargetPosition.getX() - sigma,
                leftPalmTargetPosition.getX() + sigma,
                leftPalmTargetPosition.getY() - sigma,
                leftPalmTargetPosition.getY() + sigma,
                leftPalmTargetPosition.getZ() - sigma,
                leftPalmTargetPosition.getZ() + sigma);
    }

    public Flux<ValterLeftPalmFKTuple> getAllValterLeftPalmFKTuples(Double sigma) {
        if (sigma == null) {
            return valterLeftPalmFKTupleRepository.findAll();
        } else {
            List<ValterLeftPalmFKTuple> acceptedLeftPalmFKTuples = new ArrayList<ValterLeftPalmFKTuple>();
            return Flux.fromIterable(valterLeftPalmFKTupleRepository.findAll().filter(valterLeftPalmFKTuple -> {
                boolean accepted = true;
                for (ValterLeftPalmFKTuple acceptedLeftPalmFKTuple : acceptedLeftPalmFKTuples) {
                    double distance = Math.sqrt(
                            Math.pow((acceptedLeftPalmFKTuple.getLeftPalmTargetPosition().getX() - valterLeftPalmFKTuple.getLeftPalmTargetPosition().getX()), 2)
                            +
                            Math.pow((acceptedLeftPalmFKTuple.getLeftPalmTargetPosition().getY() - valterLeftPalmFKTuple.getLeftPalmTargetPosition().getY()), 2)
                            +
                            Math.pow((acceptedLeftPalmFKTuple.getLeftPalmTargetPosition().getZ() - valterLeftPalmFKTuple.getLeftPalmTargetPosition().getZ()), 2)
                        );
                    if (distance < sigma) {
                        accepted = false;
                        break;
                    }
                }
                if (accepted) acceptedLeftPalmFKTuples.add(valterLeftPalmFKTuple);
                return accepted;
            })
            .collectList()
            .block());
        }
    }

    public Flux<ValterLeftPalmFKTuple> getAllValterLeftPalmFKTuplesNormalized(Double sigma) {
        ValterLeftPalmFKTuplesNormalizationBounds valterLeftPalmFKTuplesNormalizationBounds = new ValterLeftPalmFKTuplesNormalizationBounds();

        return getValterLeftPalmFKTuplesNormalizationBounds(sigma)
                .doOnSuccess(leftPalmFKTuplesNormalizationBounds -> {
                    valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionXMin(leftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionXMin());
                    valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionXMax(leftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionXMax());
                    valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionYMin(leftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionYMin());
                    valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionYMax(leftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionYMax());
                    valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionZMin(leftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionZMin());
                    valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionZMax(leftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionZMax());
                    valterLeftPalmFKTuplesNormalizationBounds.setShoulderLeftLinkValueMin(leftPalmFKTuplesNormalizationBounds.getShoulderLeftLinkValueMin());
                    valterLeftPalmFKTuplesNormalizationBounds.setShoulderLeftLinkValueMax(leftPalmFKTuplesNormalizationBounds.getShoulderLeftLinkValueMax());
                    valterLeftPalmFKTuplesNormalizationBounds.setLimbLeftLinkValueMin(leftPalmFKTuplesNormalizationBounds.getLimbLeftLinkValueMin());
                    valterLeftPalmFKTuplesNormalizationBounds.setLimbLeftLinkValueMax(leftPalmFKTuplesNormalizationBounds.getLimbLeftLinkValueMax());
                    valterLeftPalmFKTuplesNormalizationBounds.setArmLeftLinkValueMin(leftPalmFKTuplesNormalizationBounds.getArmLeftLinkValueMin());
                    valterLeftPalmFKTuplesNormalizationBounds.setArmLeftLinkValueMax(leftPalmFKTuplesNormalizationBounds.getArmLeftLinkValueMax());
                    valterLeftPalmFKTuplesNormalizationBounds.setForearmRollLeftLinkValueMin(leftPalmFKTuplesNormalizationBounds.getForearmRollLeftLinkValueMin());
                    valterLeftPalmFKTuplesNormalizationBounds.setForearmRollLeftLinkValueMax(leftPalmFKTuplesNormalizationBounds.getForearmRollLeftLinkValueMax());
                })
                .thenMany(getAllValterLeftPalmFKTuples(sigma).map(valterLeftPalmFKTuple -> {
                    double nX = ANNUtils.normalizeNegPos(valterLeftPalmFKTuple.getLeftPalmTargetPosition().getX(), valterLeftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionXMin(), valterLeftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionXMax());
                    double nY = ANNUtils.normalizeNegPos(valterLeftPalmFKTuple.getLeftPalmTargetPosition().getY(), valterLeftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionYMin(), valterLeftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionYMax());
                    double nZ = ANNUtils.normalizeNegPos(valterLeftPalmFKTuple.getLeftPalmTargetPosition().getZ(), valterLeftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionZMin(), valterLeftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionZMax());
                    double nShoulderLeftLinkValue = ANNUtils.normalizeNegPos(valterLeftPalmFKTuple.getShoulderLeftLinkValue(), valterLeftPalmFKTuplesNormalizationBounds.getShoulderLeftLinkValueMin(), valterLeftPalmFKTuplesNormalizationBounds.getShoulderLeftLinkValueMax());
                    double nLimbLeftLinkValue = ANNUtils.normalizeNegPos(valterLeftPalmFKTuple.getLimbLeftLinkValue(), valterLeftPalmFKTuplesNormalizationBounds.getLimbLeftLinkValueMin(), valterLeftPalmFKTuplesNormalizationBounds.getLimbLeftLinkValueMax());
                    double nArmLeftLinkValue = ANNUtils.normalizeNegPos(valterLeftPalmFKTuple.getArmLeftLinkValue(), valterLeftPalmFKTuplesNormalizationBounds.getArmLeftLinkValueMin(), valterLeftPalmFKTuplesNormalizationBounds.getArmLeftLinkValueMax());
                    double nForearmRollLeftLinkValue = ANNUtils.normalizeNegPos(valterLeftPalmFKTuple.getForearmRollLeftLinkValue(), valterLeftPalmFKTuplesNormalizationBounds.getForearmRollLeftLinkValueMin(), valterLeftPalmFKTuplesNormalizationBounds.getForearmRollLeftLinkValueMax());

                    valterLeftPalmFKTuple.setLeftPalmTargetPosition(new Vector3(nX, nY, nZ));
                    valterLeftPalmFKTuple.setShoulderLeftLinkValue(nShoulderLeftLinkValue);
                    valterLeftPalmFKTuple.setLimbLeftLinkValue(nLimbLeftLinkValue);
                    valterLeftPalmFKTuple.setArmLeftLinkValue(nArmLeftLinkValue);
                    valterLeftPalmFKTuple.setForearmRollLeftLinkValue(nForearmRollLeftLinkValue);

                    return valterLeftPalmFKTuple;
                }));
    }

    public Mono<ValterLeftPalmFKTuplesNormalizationBounds> getValterLeftPalmFKTuplesNormalizationBounds(Double sigma) {
        ValterLeftPalmFKTuplesNormalizationBounds valterLeftPalmFKTuplesNormalizationBounds = new ValterLeftPalmFKTuplesNormalizationBounds();

        if (sigma == null) {
            Mono<ValterLeftPalmFKTuple> leftPalmTargetPositionXMinRequest = valterLeftPalmFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "leftPalmTargetPosition.x"));
            Mono<ValterLeftPalmFKTuple> leftPalmTargetPositionXMaxRequest = valterLeftPalmFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "leftPalmTargetPosition.x"));
            Mono<ValterLeftPalmFKTuple> leftPalmTargetPositionYMinRequest = valterLeftPalmFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "leftPalmTargetPosition.y"));
            Mono<ValterLeftPalmFKTuple> leftPalmTargetPositionYMaxRequest = valterLeftPalmFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "leftPalmTargetPosition.y"));
            Mono<ValterLeftPalmFKTuple> leftPalmTargetPositionZMinRequest = valterLeftPalmFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "leftPalmTargetPosition.z"));
            Mono<ValterLeftPalmFKTuple> leftPalmTargetPositionZMaxRequest = valterLeftPalmFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "leftPalmTargetPosition.z"));
            Mono<ValterLeftPalmFKTuple> shoulderLeftLinkValueMinRequest = valterLeftPalmFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "shoulderLeftLinkValue"));
            Mono<ValterLeftPalmFKTuple> shoulderLeftLinkValueMaxRequest = valterLeftPalmFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "shoulderLeftLinkValue"));
            Mono<ValterLeftPalmFKTuple> limbLeftLinkValueMinRequest = valterLeftPalmFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "limbLeftLinkValue"));
            Mono<ValterLeftPalmFKTuple> limbLeftLinkValueMaxRequest = valterLeftPalmFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "limbLeftLinkValue"));
            Mono<ValterLeftPalmFKTuple> armLeftLinkValueMinRequest = valterLeftPalmFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "armLeftLinkValue"));
            Mono<ValterLeftPalmFKTuple> armLeftLinkValueMaxRequest = valterLeftPalmFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "armLeftLinkValue"));
            Mono<ValterLeftPalmFKTuple> forearmRollLeftLinkValueMinRequest = valterLeftPalmFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "forearmRollLeftLinkValue"));
            Mono<ValterLeftPalmFKTuple> forearmRollLeftLinkValueMaxRequest = valterLeftPalmFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "forearmRollLeftLinkValue"));

            return
                    leftPalmTargetPositionXMinRequest
                    .doOnSuccess(tuple -> {
                        valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionXMin(tuple.getLeftPalmTargetPosition().getX());
                    })
                    .then(leftPalmTargetPositionXMaxRequest) 
                    .doOnSuccess(tuple -> {
                        valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionXMax(tuple.getLeftPalmTargetPosition().getX());
                    })
                    .then(leftPalmTargetPositionYMinRequest) 
                    .doOnSuccess(tuple -> {
                        valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionYMin(tuple.getLeftPalmTargetPosition().getY());
                    })
                    .then(leftPalmTargetPositionYMaxRequest) 
                    .doOnSuccess(tuple -> {
                        valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionYMax(tuple.getLeftPalmTargetPosition().getY());
                    })
                    .then(leftPalmTargetPositionZMinRequest) 
                    .doOnSuccess(tuple -> {
                        valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionZMin(tuple.getLeftPalmTargetPosition().getZ());
                    })
                    .then(leftPalmTargetPositionZMaxRequest) 
                    .doOnSuccess(tuple -> {
                        valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionZMax(tuple.getLeftPalmTargetPosition().getZ());
                    })
                    .then(shoulderLeftLinkValueMinRequest) 
                    .doOnSuccess(tuple -> {
                        valterLeftPalmFKTuplesNormalizationBounds.setShoulderLeftLinkValueMin(tuple.getShoulderLeftLinkValue());
                    })
                    .then(shoulderLeftLinkValueMaxRequest) 
                    .doOnSuccess(tuple -> {
                        valterLeftPalmFKTuplesNormalizationBounds.setShoulderLeftLinkValueMax(tuple.getShoulderLeftLinkValue());
                    })
                    .then(limbLeftLinkValueMinRequest) 
                    .doOnSuccess(tuple -> {
                        valterLeftPalmFKTuplesNormalizationBounds.setLimbLeftLinkValueMin(tuple.getLimbLeftLinkValue());
                    })
                    .then(limbLeftLinkValueMaxRequest) 
                    .doOnSuccess(tuple -> {
                        valterLeftPalmFKTuplesNormalizationBounds.setLimbLeftLinkValueMax(tuple.getLimbLeftLinkValue());
                    })
                    .then(armLeftLinkValueMinRequest) 
                    .doOnSuccess(tuple -> {
                        valterLeftPalmFKTuplesNormalizationBounds.setArmLeftLinkValueMin(tuple.getArmLeftLinkValue());
                    })
                    .then(armLeftLinkValueMaxRequest) 
                    .doOnSuccess(tuple -> {
                        valterLeftPalmFKTuplesNormalizationBounds.setArmLeftLinkValueMax(tuple.getArmLeftLinkValue());
                    })
                    .then(forearmRollLeftLinkValueMinRequest) 
                    .doOnSuccess(tuple -> {
                        valterLeftPalmFKTuplesNormalizationBounds.setForearmRollLeftLinkValueMin(tuple.getForearmRollLeftLinkValue());
                    })
                    .then(forearmRollLeftLinkValueMaxRequest) 
                    .doOnSuccess(tuple -> {
                        valterLeftPalmFKTuplesNormalizationBounds.setForearmRollLeftLinkValueMax(tuple.getForearmRollLeftLinkValue());
                    })
                    .map(tuple -> {
                        return valterLeftPalmFKTuplesNormalizationBounds;
                    });
        } else {
            getAllValterLeftPalmFKTuples(sigma)
            .collectList()
            .block()
            .forEach(filteredTuple -> {
                if (filteredTuple.getLeftPalmTargetPosition().getX() < valterLeftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionXMin()) {
                    valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionXMin(filteredTuple.getLeftPalmTargetPosition().getX());
                }
                if (filteredTuple.getLeftPalmTargetPosition().getX() > valterLeftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionXMax()) {
                    valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionXMax(filteredTuple.getLeftPalmTargetPosition().getX());
                }
                if (filteredTuple.getLeftPalmTargetPosition().getY() < valterLeftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionYMin()) {
                    valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionYMin(filteredTuple.getLeftPalmTargetPosition().getY());
                }
                if (filteredTuple.getLeftPalmTargetPosition().getY() > valterLeftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionYMax()) {
                    valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionYMax(filteredTuple.getLeftPalmTargetPosition().getY());
                }
                if (filteredTuple.getLeftPalmTargetPosition().getZ() < valterLeftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionZMin()) {
                    valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionZMin(filteredTuple.getLeftPalmTargetPosition().getZ());
                }
                if (filteredTuple.getLeftPalmTargetPosition().getZ() > valterLeftPalmFKTuplesNormalizationBounds.getLeftPalmTargetPositionZMax()) {
                    valterLeftPalmFKTuplesNormalizationBounds.setLeftPalmTargetPositionZMax(filteredTuple.getLeftPalmTargetPosition().getZ());
                }

                if (filteredTuple.getShoulderLeftLinkValue() < valterLeftPalmFKTuplesNormalizationBounds.getShoulderLeftLinkValueMin()) {
                    valterLeftPalmFKTuplesNormalizationBounds.setShoulderLeftLinkValueMin(filteredTuple.getShoulderLeftLinkValue());
                }
                if (filteredTuple.getShoulderLeftLinkValue() > valterLeftPalmFKTuplesNormalizationBounds.getShoulderLeftLinkValueMax()) {
                    valterLeftPalmFKTuplesNormalizationBounds.setShoulderLeftLinkValueMax(filteredTuple.getShoulderLeftLinkValue());
                }
                if (filteredTuple.getLimbLeftLinkValue() < valterLeftPalmFKTuplesNormalizationBounds.getLimbLeftLinkValueMin()) {
                    valterLeftPalmFKTuplesNormalizationBounds.setLimbLeftLinkValueMin(filteredTuple.getLimbLeftLinkValue());
                }
                if (filteredTuple.getLimbLeftLinkValue() > valterLeftPalmFKTuplesNormalizationBounds.getLimbLeftLinkValueMax()) {
                    valterLeftPalmFKTuplesNormalizationBounds.setLimbLeftLinkValueMax(filteredTuple.getLimbLeftLinkValue());
                }
                if (filteredTuple.getArmLeftLinkValue() < valterLeftPalmFKTuplesNormalizationBounds.getArmLeftLinkValueMin()) {
                    valterLeftPalmFKTuplesNormalizationBounds.setArmLeftLinkValueMin(filteredTuple.getArmLeftLinkValue());
                }
                if (filteredTuple.getArmLeftLinkValue() > valterLeftPalmFKTuplesNormalizationBounds.getArmLeftLinkValueMax()) {
                    valterLeftPalmFKTuplesNormalizationBounds.setArmLeftLinkValueMax(filteredTuple.getArmLeftLinkValue());
                }
                if (filteredTuple.getForearmRollLeftLinkValue() < valterLeftPalmFKTuplesNormalizationBounds.getForearmRollLeftLinkValueMin()) {
                    valterLeftPalmFKTuplesNormalizationBounds.setForearmRollLeftLinkValueMin(filteredTuple.getForearmRollLeftLinkValue());
                }
                if (filteredTuple.getForearmRollLeftLinkValue() > valterLeftPalmFKTuplesNormalizationBounds.getForearmRollLeftLinkValueMax()) {
                    valterLeftPalmFKTuplesNormalizationBounds.setForearmRollLeftLinkValueMax(filteredTuple.getForearmRollLeftLinkValue());
                }
            });

            return Mono.just(valterLeftPalmFKTuplesNormalizationBounds);
        }
    }
}
