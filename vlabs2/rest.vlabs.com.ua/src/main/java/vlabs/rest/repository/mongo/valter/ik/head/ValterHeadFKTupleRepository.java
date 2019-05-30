package vlabs.rest.repository.mongo.valter.ik.head;

import org.springframework.stereotype.Repository;

import reactor.core.publisher.Flux;
import vlabs.rest.model.three.Vector3;
import vlabs.rest.model.valter.ik.head.ValterHeadFKTuple;
import vlabs.rest.model.valter.ik.head.ValterHeadIKTuple;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

@Repository
public interface ValterHeadFKTupleRepository extends ReactiveMongoRepository<ValterHeadFKTuple, String> {
    Flux<ValterHeadIKTuple> findByTargetDirectionFromHeadYawLinkOrigin(Vector3 headTargetDirection);
}
