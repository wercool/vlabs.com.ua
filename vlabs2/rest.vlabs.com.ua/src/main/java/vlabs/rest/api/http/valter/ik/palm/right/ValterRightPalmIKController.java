package vlabs.rest.api.http.valter.ik.palm.right;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import vlabs.rest.model.three.Vector3;
import vlabs.rest.model.valter.ik.palm.right.ValterRightPalmFKTuple;
import vlabs.rest.model.valter.ik.palm.right.ValterRightPalmFKTuplesNormalizationBounds;
import vlabs.rest.service.valter.ik.palm.right.ValterRightPalmIKService;

@RestController
@RequestMapping(path = "/api/valter/palm/right/ik")
public class ValterRightPalmIKController {

    @Autowired
    private ValterRightPalmIKService valterRightPalmIKService;

    @RequestMapping(value = "/save_right_palm_fk_tuple", method = RequestMethod.POST)
    public Mono<ResponseEntity<?>> saveRightPalmFKTuple(@RequestBody ValterRightPalmFKTuple valterRightPalmFKTuple) {
        return valterRightPalmIKService.saveValterRightPalmFKTuple(valterRightPalmFKTuple).map((savedValterRightPalmFKTuple) -> {
            return ResponseEntity.ok(savedValterRightPalmFKTuple);
        });
    }

    @RequestMapping(value = "/get_right_palm_fk_tuple", method = RequestMethod.POST)
    public Flux<ValterRightPalmFKTuple> getRightPalmFKTuple(@RequestBody Vector3 rightPalmTargetPosition) {
        return valterRightPalmIKService.getValterRightPalmFKTuple(rightPalmTargetPosition);
    }

    @RequestMapping(value = "/get_all_right_palm_fk_tuples", method = RequestMethod.GET)
    public Flux<ValterRightPalmFKTuple> getAllRightPalmFKTuples(@RequestParam(value="sigma", required = false) Double sigma) {
        return valterRightPalmIKService.getAllValterRightPalmFKTuples(sigma);
    }

    @RequestMapping(value = "/get_right_palm_fk_normalization_bounds", method = RequestMethod.GET)
    public Mono<ResponseEntity<ValterRightPalmFKTuplesNormalizationBounds>> getRightPalmFKTuplesNormalizationBounds(@RequestParam(value="sigma", required = false) Double sigma) {
        return valterRightPalmIKService.getValterRightPalmFKTuplesNormalizationBounds(sigma).map(valterRightPalmFKTuplesNormalizationBounds -> {
            return ResponseEntity.ok(valterRightPalmFKTuplesNormalizationBounds);
        });
    }

    @RequestMapping(value = "/get_all_right_palm_fk_tuples_normalized", method = RequestMethod.GET)
    public Flux<ValterRightPalmFKTuple> getAllRightPalmFKTuplesNormalized(@RequestParam(value="sigma", required = false) Double sigma) {
        return valterRightPalmIKService.getAllValterRightPalmFKTuplesNormalized(sigma);
    }
}
