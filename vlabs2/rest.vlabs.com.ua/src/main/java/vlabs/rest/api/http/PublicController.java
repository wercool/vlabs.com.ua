package vlabs.rest.api.http;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;
import vlabs.rest.common.SimpleJSONResponse;

@RestController
@RequestMapping(path = "/api/public")
public class PublicController {

    @RequestMapping(value = "/ping", method = RequestMethod.GET)
    public Mono<ResponseEntity<SimpleJSONResponse>> ping() {
        return Mono.just(ResponseEntity.ok(new SimpleJSONResponse("PONG")));
    }
    @RequestMapping(value = "/echo/{echoStr}", method = RequestMethod.GET)
    public Mono<ResponseEntity<SimpleJSONResponse>> echo(@PathVariable String echoStr) {
        return Mono.just(ResponseEntity.ok(new SimpleJSONResponse(echoStr)));
    }
}
