package vlabs.rest.repository.mongo.valter.ik.head;

import org.springframework.stereotype.Repository;

import reactor.core.publisher.Flux;
import vlabs.rest.model.valter.ik.head.ValterHeadFKTuple;

import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;

@Repository
public interface ValterHeadFKTupleRepository extends ReactiveMongoRepository<ValterHeadFKTuple, String> {
    Flux<ValterHeadFKTuple> findAll();

    @Query("{ "
            + "'headTargetDirection.x' : { '$gt' : ?0, '$lt' : ?1 }, "
            + "'headTargetDirection.y' : { '$gt' : ?2, '$lt' : ?3 }, "
            + "'headTargetDirection.z' : { '$gt' : ?4, '$lt' : ?5 }  "
            + " }")
    Flux<ValterHeadFKTuple> findByHeadDirectionXYZMinMax(
            double minX,
            double maxX,
            double minY,
            double maxY,
            double minZ,
            double maxZ);
}
