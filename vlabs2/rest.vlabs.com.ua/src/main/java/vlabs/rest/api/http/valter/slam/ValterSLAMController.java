package vlabs.rest.api.http.valter.slam;

import java.awt.PageAttributes.MediaType;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vlabs.rest.model.valter.slam.SLAMRGBDBytesCmdVelOrientationTuple;
import vlabs.rest.model.valter.slam.SLAMRGBDCmdVelOrientationTuple;
import vlabs.rest.model.valter.slam.SLAMRGBDCmdVelOrientationTupleNormalized;
import vlabs.rest.service.valter.slam.ValterSLAMService;

@RestController
@RequestMapping(path = "/api/valter/slam")
public class ValterSLAMController {

    private static final Logger log = LoggerFactory.getLogger(ValterSLAMController.class);

    @Autowired
    private ValterSLAMService valterSLAMService;

    @RequestMapping(value = "/save_slam_tuple", method = RequestMethod.POST)
    public Mono<ResponseEntity<?>> saveSLAMRGBDCmdVelOrientationTuple(@RequestBody SLAMRGBDCmdVelOrientationTuple slamRGBDCmdVelOrientationTuple) {
        return valterSLAMService.saveSLAMRGBDCmdVelOrientationTuple(slamRGBDCmdVelOrientationTuple).map((savedSLAMRGBDCmdVelOrientationTuple) -> {
            return ResponseEntity.ok(savedSLAMRGBDCmdVelOrientationTuple);
        });
    }

    @RequestMapping(value = "/get_all_slam_tuples", method = RequestMethod.GET)
    public Flux<SLAMRGBDCmdVelOrientationTuple> getAllSLAMRGBDCmdVelOrientationTuples() {
        return valterSLAMService.getSLAMRGBDCmdVelOrientationTuples();
    }

    @RequestMapping(value = "/get_all_slam_tuples_rgbd_bytes", method = RequestMethod.GET)
    public Flux<SLAMRGBDBytesCmdVelOrientationTuple> getAllSLAMRGBDBytesCmdVelOrientationTuples() {
        return valterSLAMService.getSLAMRGBDBytesCmdVelOrientationTuples();
    }

    @RequestMapping(value = "/get_all_slam_tuples_normalized")
    public Flux<SLAMRGBDCmdVelOrientationTupleNormalized> getAllSLAMRGBDCmdVelOrientationTuplesNormalized() {
        return valterSLAMService.getSLAMRGBDCmdVelOrientationTuplesNormalized();
    }

//    @RequestMapping(value = "/get_stream_all_slam_tuples_normalized", method = RequestMethod.GET, produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
//    public Flux<ServerSentEvent<SLAMRGBDCmdVelOrientationTupleNormalized>> getStreamAllSLAMRGBDCmdVelOrientationTuplesNormalized() {
//        return valterSLAMService.getSLAMRGBDCmdVelOrientationTuplesNormalized()
//                .map(slamRGBDCmdVelOrientationTuplesNormalized -> 
//                ServerSentEvent.<SLAMRGBDCmdVelOrientationTupleNormalized>builder()
//                        .event("SLAM tuple")
//                        .id(Long.toString(slamRGBDCmdVelOrientationTuplesNormalized.getSseId()))
//                        .data(slamRGBDCmdVelOrientationTuplesNormalized)
//                        .build());
//    }

  @RequestMapping(value = "/get_stream_all_slam_tuples_normalized", method = RequestMethod.GET, produces = org.springframework.http.MediaType.TEXT_EVENT_STREAM_VALUE)
  public Flux<SLAMRGBDCmdVelOrientationTupleNormalized> getStreamAllSLAMRGBDCmdVelOrientationTuplesNormalized() {
      return valterSLAMService.getSLAMRGBDCmdVelOrientationTuplesNormalized();
  }
}
