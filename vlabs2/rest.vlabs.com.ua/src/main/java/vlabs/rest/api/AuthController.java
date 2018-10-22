package vlabs.rest.api;

import static org.springframework.http.MediaType.APPLICATION_JSON_UTF8;
import static org.springframework.http.MediaType.APPLICATION_JSON_UTF8_VALUE;
import static org.springframework.http.ResponseEntity.notFound;
import static org.springframework.http.ResponseEntity.ok;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;

import static org.springframework.web.bind.annotation.RequestMethod.POST;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;

import vlabs.rest.config.security.JWTAuthenticationRequest;
import vlabs.rest.config.security.JWTAuthenticationResponse;
import vlabs.rest.config.security.JWTTokenUtil;

@RestController
@RequestMapping(path = "/auth", produces = { APPLICATION_JSON_UTF8_VALUE })
public class AuthController {

    @Autowired private JWTTokenUtil jwtTokenUtil;

    @RequestMapping(method = POST, value = "/token")
    @CrossOrigin("*")
    public Mono<ResponseEntity<JWTAuthenticationResponse>> token(@RequestBody JWTAuthenticationRequest authenticationRequest) throws AuthenticationException {
        String username =  authenticationRequest.getUsername();
        String password =  authenticationRequest.getPassword();

        return null;

//        return repo.findByUsername(authenticationRequest.getUsername())
//            .map(user->ok().contentType(APPLICATION_JSON_UTF8).body(
//                    new JwtAuthenticationResponse(jwtTokenUtil.generateToken(user), user.getUsername()))
//            )
//            .defaultIfEmpty(notFound().build());
    }
}
