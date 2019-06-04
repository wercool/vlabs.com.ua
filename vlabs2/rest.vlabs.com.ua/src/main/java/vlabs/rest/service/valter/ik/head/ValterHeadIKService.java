package vlabs.rest.service.valter.ik.head;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vlabs.rest.model.three.Vector3;
import vlabs.rest.model.valter.ik.head.ValterHeadFKTuple;
import vlabs.rest.repository.mongo.valter.ik.head.ValterHeadFKTupleRepository;

@Service
public class ValterHeadIKService {

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
}
