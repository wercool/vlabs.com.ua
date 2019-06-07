package vlabs.rest.service.valter.ik.palm.right;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vlabs.rest.model.three.Vector3;
import vlabs.rest.model.valter.ik.palm.right.ValterRightPalmFKTuple;
import vlabs.rest.repository.mongo.valter.ik.palm.right.ValterRightPalmFKTupleRepository;

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
}
