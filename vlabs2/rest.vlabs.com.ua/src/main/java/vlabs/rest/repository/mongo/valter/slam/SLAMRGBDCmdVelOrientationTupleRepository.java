package vlabs.rest.repository.mongo.valter.slam;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.stereotype.Repository;

import vlabs.rest.model.valter.slam.SLAMRGBDCmdVelOrientationTuple;

@Repository
public interface SLAMRGBDCmdVelOrientationTupleRepository  extends ReactiveMongoRepository<SLAMRGBDCmdVelOrientationTuple, String> {

}
