package vlabs.rest.api.http.valter.slam;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;
import vlabs.rest.model.valter.slam.SLAMRGBDCmdVelOrientationTuple;
import vlabs.rest.service.valter.slam.ValterSLAMService;

@RestController
@RequestMapping(path = "/api/valter/slam")
public class ValterSLAMController {

    @Autowired
    private ValterSLAMService valterSLAMService;

    @RequestMapping(value = "/save_slam_tuple", method = RequestMethod.POST)
    public Mono<ResponseEntity<?>> saveSLAMRGBDCmdVelOrientationTuple(@RequestBody SLAMRGBDCmdVelOrientationTuple slamRGBDCmdVelOrientationTuple) {
        return valterSLAMService.saveSLAMRGBDCmdVelOrientationTuple(slamRGBDCmdVelOrientationTuple).map((savedSLAMRGBDCmdVelOrientationTuple) -> {
            return ResponseEntity.ok(savedSLAMRGBDCmdVelOrientationTuple);
        });
    }
}
