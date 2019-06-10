package vlabs.rest.repository.mongo.valter.ik.palm.right;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vlabs.rest.model.valter.ik.palm.right.ValterRightPalmFKTuple;

public interface ValterRightPalmFKTupleRepository  extends ReactiveMongoRepository<ValterRightPalmFKTuple, String> {
    Flux<ValterRightPalmFKTuple> findAll();

    @Query("{ "
            + "'rightPalmTargetPosition.x' : { '$gt' : ?0, '$lt' : ?1 }, "
            + "'rightPalmTargetPosition.y' : { '$gt' : ?2, '$lt' : ?3 }, "
            + "'rightPalmTargetPosition.z' : { '$gt' : ?4, '$lt' : ?5 }  "
            + " }")
    Flux<ValterRightPalmFKTuple> findByRightPalmTargetXYZMinMax(
            double minX,
            double maxX,
            double minY,
            double maxY,
            double minZ,
            double maxZ);
    
    @Query("{}")
    Mono<ValterRightPalmFKTuple> findOne(Sort sort);
}
