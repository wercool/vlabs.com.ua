package vlabs.rest.api.http.valter.ik.palm.left;

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
import vlabs.rest.model.valter.ik.palm.left.ValterLeftPalmFKTuple;
import vlabs.rest.model.valter.ik.palm.left.ValterLeftPalmFKTuplesNormalizationBounds;
import vlabs.rest.service.valter.ik.palm.left.ValterLeftPalmIKService;

@RestController
@RequestMapping(path = "/api/valter/palm/left/ik")
public class ValterLeftPalmIKController {

    @Autowired
    private ValterLeftPalmIKService valterLeftPalmIKService;

    @RequestMapping(value = "/save_left_palm_fk_tuple", method = RequestMethod.POST)
    public Mono<ResponseEntity<?>> saveLeftPalmFKTuple(@RequestBody ValterLeftPalmFKTuple valterLeftPalmFKTuple) {
        return valterLeftPalmIKService.saveValterLeftPalmFKTuple(valterLeftPalmFKTuple).map((savedValterLeftPalmFKTuple) -> {
            return ResponseEntity.ok(savedValterLeftPalmFKTuple);
        });
    }

    @RequestMapping(value = "/get_left_palm_fk_tuple", method = RequestMethod.POST)
    public Flux<ValterLeftPalmFKTuple> getLeftPalmFKTuple(@RequestBody Vector3 leftPalmTargetPosition) {
        return valterLeftPalmIKService.getValterLeftPalmFKTuple(leftPalmTargetPosition);
    }

    @RequestMapping(value = "/get_all_left_palm_fk_tuples", method = RequestMethod.GET)
    public Flux<ValterLeftPalmFKTuple> getAllLeftPalmFKTuples(@RequestParam(value="sigma", required = false) Double sigma) {
        return valterLeftPalmIKService.getAllValterLeftPalmFKTuples(sigma);
    }

    @RequestMapping(value = "/get_left_palm_fk_normalization_bounds", method = RequestMethod.GET)
    public Mono<ResponseEntity<ValterLeftPalmFKTuplesNormalizationBounds>> getLeftPalmFKTuplesNormalizationBounds(@RequestParam(value="sigma", required = false) Double sigma) {
        return valterLeftPalmIKService.getValterLeftPalmFKTuplesNormalizationBounds(sigma).map(valterLeftPalmFKTuplesNormalizationBounds -> {
            return ResponseEntity.ok(valterLeftPalmFKTuplesNormalizationBounds);
        });
    }

    @RequestMapping(value = "/get_all_left_palm_fk_tuples_normalized", method = RequestMethod.GET)
    public Flux<ValterLeftPalmFKTuple> getAllLeftPalmFKTuplesNormalized(@RequestParam(value="sigma", required = false) Double sigma) {
        return valterLeftPalmIKService.getAllValterLeftPalmFKTuplesNormalized(sigma);
    }
}
