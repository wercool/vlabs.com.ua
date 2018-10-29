package vlabs.rest.api.http;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;
import vlabs.rest.config.security.CustomPasswordEncoder;

@RestController
@RequestMapping(path = "/api/aux")
public class AuxiliariesController {

    @Autowired
    CustomPasswordEncoder customPasswordEncoder;

    @RequestMapping(value = "/encode/{str}", method = RequestMethod.GET)
    public Mono<ResponseEntity<String>> encode(@PathVariable("str") String str) {
        return Mono.just(ResponseEntity.ok(customPasswordEncoder.encode(str)));
    }
}
