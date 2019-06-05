package vlabs.rest.service.valter.ik.head;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vlabs.rest.model.three.Vector3;
import vlabs.rest.model.valter.ik.head.ValterHeadFKTuple;
import vlabs.rest.model.valter.ik.head.ValterHeadFKTuplesNormalizationBounds;
import vlabs.rest.repository.mongo.valter.ik.head.ValterHeadFKTupleRepository;
import vlabs.rest.utils.ann.ANNUtils;

@Service
public class ValterHeadIKService {

    private static final Logger log = LoggerFactory.getLogger(ValterHeadIKService.class);

    @Autowired
    ValterHeadFKTupleRepository valterHeadFKTupleRepository;

    public Mono<ValterHeadFKTuple> saveValterHeadFKTuple(ValterHeadFKTuple valterHeadFKTuple) {
        return valterHeadFKTupleRepository.save(valterHeadFKTuple);
    }

    public Flux<ValterHeadFKTuple> getValterHeadFKTuple(Vector3 headTargetPosition) {
        double sigma = 0.15;
        return (Flux<ValterHeadFKTuple>) valterHeadFKTupleRepository.findByHeadTargetXYZMinMax(
                headTargetPosition.getX() - sigma,
                headTargetPosition.getX() + sigma,
                headTargetPosition.getY() - sigma,
                headTargetPosition.getY() + sigma,
                headTargetPosition.getZ() - sigma,
                headTargetPosition.getZ() + sigma);
    }

    public Flux<ValterHeadFKTuple> getAllValterHeadFKTuples() {
        return valterHeadFKTupleRepository.findAll();
    }

    public Flux<ValterHeadFKTuple> getAllValterHeadFKTuplesNormalized() {

        ValterHeadFKTuplesNormalizationBounds valterHeadFKTuplesNormalizationBounds = new ValterHeadFKTuplesNormalizationBounds();

        return getValterHeadFKTuplesNormalizationBounds()
                .doOnSuccess(headFKTuplesNormalizationBounds -> {
                    valterHeadFKTuplesNormalizationBounds.setHeadTargetPositionXMin(headFKTuplesNormalizationBounds.getHeadTargetPositionXMin());
                    valterHeadFKTuplesNormalizationBounds.setHeadTargetPositionXMax(headFKTuplesNormalizationBounds.getHeadTargetPositionXMax());
                    valterHeadFKTuplesNormalizationBounds.setHeadTargetPositionYMin(headFKTuplesNormalizationBounds.getHeadTargetPositionYMin());
                    valterHeadFKTuplesNormalizationBounds.setHeadTargetPositionYMax(headFKTuplesNormalizationBounds.getHeadTargetPositionYMax());
                    valterHeadFKTuplesNormalizationBounds.setHeadTargetPositionZMin(headFKTuplesNormalizationBounds.getHeadTargetPositionZMin());
                    valterHeadFKTuplesNormalizationBounds.setHeadTargetPositionZMax(headFKTuplesNormalizationBounds.getHeadTargetPositionZMax());
                    valterHeadFKTuplesNormalizationBounds.setHeadYawLinkValueMin(headFKTuplesNormalizationBounds.getHeadYawLinkValueMin());
                    valterHeadFKTuplesNormalizationBounds.setHeadYawLinkValueMax(headFKTuplesNormalizationBounds.getHeadYawLinkValueMax());
                    valterHeadFKTuplesNormalizationBounds.setHeadTiltLinkValueMin(headFKTuplesNormalizationBounds.getHeadTiltLinkValueMin());
                    valterHeadFKTuplesNormalizationBounds.setHeadTiltLinkValueMax(headFKTuplesNormalizationBounds.getHeadTiltLinkValueMax());
                })
                .thenMany(getAllValterHeadFKTuples().map(valterHeadFKTuple -> {
                    double nX = ANNUtils.normalizeNegPos(valterHeadFKTuple.getHeadTargetPosition().getX(), valterHeadFKTuplesNormalizationBounds.getHeadTargetPositionXMin(), valterHeadFKTuplesNormalizationBounds.getHeadTargetPositionXMax());
                    double nY = ANNUtils.normalizeNegPos(valterHeadFKTuple.getHeadTargetPosition().getY(), valterHeadFKTuplesNormalizationBounds.getHeadTargetPositionYMin(), valterHeadFKTuplesNormalizationBounds.getHeadTargetPositionYMax());
                    double nZ = ANNUtils.normalizeNegPos(valterHeadFKTuple.getHeadTargetPosition().getZ(), valterHeadFKTuplesNormalizationBounds.getHeadTargetPositionZMin(), valterHeadFKTuplesNormalizationBounds.getHeadTargetPositionZMax());
                    double nYawValue = ANNUtils.normalizeNegPos(valterHeadFKTuple.getHeadYawLinkValue(), valterHeadFKTuplesNormalizationBounds.getHeadYawLinkValueMin(), valterHeadFKTuplesNormalizationBounds.getHeadYawLinkValueMax());
                    double nTiltValue = ANNUtils.normalizeNegPos(valterHeadFKTuple.getHeadTiltLinkValue(), valterHeadFKTuplesNormalizationBounds.getHeadTiltLinkValueMin(), valterHeadFKTuplesNormalizationBounds.getHeadTiltLinkValueMax());

                    valterHeadFKTuple.setHeadTargetPosition(new Vector3(nX, nY, nZ));
                    valterHeadFKTuple.setHeadYawLinkValue(nYawValue);
                    valterHeadFKTuple.setHeadTiltLinkValue(nTiltValue);

                    return valterHeadFKTuple;
                }));
    }

    public Mono<ValterHeadFKTuplesNormalizationBounds> getValterHeadFKTuplesNormalizationBounds() {
        ValterHeadFKTuplesNormalizationBounds valterHeadFKTuplesNormalizationBounds = new ValterHeadFKTuplesNormalizationBounds();

        Mono<ValterHeadFKTuple> headTargetPositionXMinTupleRequest = valterHeadFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "headTargetPosition.x"));
        Mono<ValterHeadFKTuple> headTargetPositionXMaxTupleRequest = valterHeadFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "headTargetPosition.x"));
        Mono<ValterHeadFKTuple> headTargetPositionYMinTupleRequest = valterHeadFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "headTargetPosition.y"));
        Mono<ValterHeadFKTuple> headTargetPositionYMaxTupleRequest = valterHeadFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "headTargetPosition.y"));
        Mono<ValterHeadFKTuple> headTargetPositionZMinTupleRequest = valterHeadFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "headTargetPosition.z"));
        Mono<ValterHeadFKTuple> headTargetPositionZMaxTupleRequest = valterHeadFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "headTargetPosition.z"));
        Mono<ValterHeadFKTuple> headYawLinkValueMinTupleRequest = valterHeadFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "headYawLinkValue"));
        Mono<ValterHeadFKTuple> headYawLinkValueMaxTupleRequest = valterHeadFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "headYawLinkValue"));
        Mono<ValterHeadFKTuple> headTiltLinkValueMinTupleRequest = valterHeadFKTupleRepository.findOne(new Sort(Sort.Direction.ASC, "headTiltLinkValue"));
        Mono<ValterHeadFKTuple> headTiltLinkValueMaxTupleRequest = valterHeadFKTupleRepository.findOne(new Sort(Sort.Direction.DESC, "headTiltLinkValue"));

        return
                headTargetPositionXMinTupleRequest
                .doOnSuccess(tuple -> {
                    valterHeadFKTuplesNormalizationBounds.setHeadTargetPositionXMin(tuple.getHeadTargetPosition().getX());
                })
                .then(headTargetPositionXMaxTupleRequest) 
                .doOnSuccess(tuple -> {
                    valterHeadFKTuplesNormalizationBounds.setHeadTargetPositionXMax(tuple.getHeadTargetPosition().getX());
                })
                .then(headTargetPositionYMinTupleRequest) 
                .doOnSuccess(tuple -> {
                    valterHeadFKTuplesNormalizationBounds.setHeadTargetPositionYMin(tuple.getHeadTargetPosition().getY());
                })
                .then(headTargetPositionYMaxTupleRequest) 
                .doOnSuccess(tuple -> {
                    valterHeadFKTuplesNormalizationBounds.setHeadTargetPositionYMax(tuple.getHeadTargetPosition().getY());
                })
                .then(headTargetPositionZMinTupleRequest) 
                .doOnSuccess(tuple -> {
                    valterHeadFKTuplesNormalizationBounds.setHeadTargetPositionZMin(tuple.getHeadTargetPosition().getZ());
                })
                .then(headTargetPositionZMaxTupleRequest) 
                .doOnSuccess(tuple -> {
                    valterHeadFKTuplesNormalizationBounds.setHeadTargetPositionZMax(tuple.getHeadTargetPosition().getZ());
                })
                .then(headYawLinkValueMinTupleRequest) 
                .doOnSuccess(tuple -> {
                    valterHeadFKTuplesNormalizationBounds.setHeadYawLinkValueMin(tuple.getHeadYawLinkValue());
                })
                .then(headYawLinkValueMaxTupleRequest) 
                .doOnSuccess(tuple -> {
                    valterHeadFKTuplesNormalizationBounds.setHeadYawLinkValueMax(tuple.getHeadYawLinkValue());
                })
                .then(headTiltLinkValueMinTupleRequest) 
                .doOnSuccess(tuple -> {
                    valterHeadFKTuplesNormalizationBounds.setHeadTiltLinkValueMin(tuple.getHeadTiltLinkValue());
                })
                .then(headTiltLinkValueMaxTupleRequest) 
                .doOnSuccess(tuple -> {
                    valterHeadFKTuplesNormalizationBounds.setHeadTiltLinkValueMax(tuple.getHeadTiltLinkValue());
                })
                .map(tuple -> {
                    return valterHeadFKTuplesNormalizationBounds;
                });
    }
}
