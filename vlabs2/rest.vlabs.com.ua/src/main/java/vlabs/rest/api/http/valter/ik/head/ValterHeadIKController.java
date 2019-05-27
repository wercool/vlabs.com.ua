package vlabs.rest.api.http.valter.ik.head;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;
import vlabs.rest.common.SimpleJSONResponse;

@RestController
@RequestMapping(path = "/api/public/valter/ik")
public class ValterHeadIKController {

    @RequestMapping(value = "/save_head_fk_tuple", method = RequestMethod.POST)
    public Mono<ResponseEntity<SimpleJSONResponse>> ping() {
        return Mono.just(ResponseEntity.ok(new SimpleJSONResponse("HEADFKTUPLE")));
    }

}