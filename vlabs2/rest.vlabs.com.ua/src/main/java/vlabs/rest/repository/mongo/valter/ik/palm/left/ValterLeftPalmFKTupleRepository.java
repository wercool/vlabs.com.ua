package vlabs.rest.repository.mongo.valter.ik.palm.left;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vlabs.rest.model.valter.ik.palm.left.ValterLeftPalmFKTuple;

public interface ValterLeftPalmFKTupleRepository  extends ReactiveMongoRepository<ValterLeftPalmFKTuple, String> {
    Flux<ValterLeftPalmFKTuple> findAll();

    @Query("{ "
            + "'leftPalmTargetPosition.x' : { '$gt' : ?0, '$lt' : ?1 }, "
            + "'leftPalmTargetPosition.y' : { '$gt' : ?2, '$lt' : ?3 }, "
            + "'leftPalmTargetPosition.z' : { '$gt' : ?4, '$lt' : ?5 }  "
            + " }")
    Flux<ValterLeftPalmFKTuple> findByLeftPalmTargetXYZMinMax(
            double minX,
            double maxX,
            double minY,
            double maxY,
            double minZ,
            double maxZ);
    
    @Query("{}")
    Mono<ValterLeftPalmFKTuple> findOne(Sort sort);
}
