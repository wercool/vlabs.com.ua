package vlabs.rest.service.valter.slam;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import reactor.core.publisher.Mono;
import vlabs.rest.model.valter.slam.SLAMRGBDCmdVelOrientationTuple;
import vlabs.rest.repository.mongo.valter.slam.SLAMRGBDCmdVelOrientationTupleRepository;

@Service
public class ValterSLAMService {
    private static final Logger log = LoggerFactory.getLogger(ValterSLAMService.class);

    @Autowired
    SLAMRGBDCmdVelOrientationTupleRepository slamRGBDCmdVelOrientationTupleRepository;

    public Mono<SLAMRGBDCmdVelOrientationTuple> saveSLAMRGBDCmdVelOrientationTuple(SLAMRGBDCmdVelOrientationTuple slamRGBDCmdVelOrientationTuple) {
        return slamRGBDCmdVelOrientationTupleRepository.save(slamRGBDCmdVelOrientationTuple);
    }
}
