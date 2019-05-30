package vlabs.rest.api.http.valter.ik.head;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vlabs.rest.model.three.Vector3;
import vlabs.rest.model.valter.ik.head.ValterHeadFKTuple;
import vlabs.rest.model.valter.ik.head.ValterHeadIKTuple;
import vlabs.rest.service.valter.ik.head.ValterHeadIKService;

@RestController
@RequestMapping(path = "/api/valter/head/ik")
public class ValterHeadIKController {

    @Autowired
    private ValterHeadIKService valterHeadIKService;

    @RequestMapping(value = "/save_head_fk_tuple", method = RequestMethod.POST)
    public Mono<ResponseEntity<?>> saveHeadFKTuple(@RequestBody ValterHeadFKTuple valterHeadFKTuple) {
        return valterHeadIKService.saveValterHeadFKTuple(valterHeadFKTuple).map((savedValterHeadFKTuple) -> {
            return ResponseEntity.ok(savedValterHeadFKTuple);
        });
    }
    @RequestMapping(value = "/get_head_ik_tuple", method = RequestMethod.POST)
    public Flux<ValterHeadIKTuple> saveHeadFKTuple(@RequestBody Vector3 headTargetDirection) {
        return valterHeadIKService.getValterHeadIKTuple(headTargetDirection);
    }

}