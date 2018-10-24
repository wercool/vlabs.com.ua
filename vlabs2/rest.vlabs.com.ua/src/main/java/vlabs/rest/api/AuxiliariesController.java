package vlabs.rest.api;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;
import vlabs.rest.security.PBKDF2Encoder;

@RestController
@RequestMapping(path = "/api/aux")
public class AuxiliariesController {
    @Autowired
    private PBKDF2Encoder passwordEncoder;

    @RequestMapping(value = "/encode/{str}", method = RequestMethod.GET)
    public Mono<ResponseEntity<String>> encode(@PathVariable("str") String str) {
        return Mono.just(ResponseEntity.ok(passwordEncoder.encode(str)));
    }
}
