package vlabs.rest.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;
import vlabs.rest.model.User;
import vlabs.rest.security.JWTUtil;
import vlabs.rest.security.PBKDF2Encoder;
import vlabs.rest.security.model.AuthRequest;
import vlabs.rest.security.model.AuthResponse;
import vlabs.rest.service.UserService;

@RestController
@RequestMapping(path = "/api/auth")
public class AuthenticationController {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationController.class);

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private PBKDF2Encoder passwordEncoder;

    @Autowired
    private UserService userService;

    @RequestMapping(value = "/attempt", method = RequestMethod.POST)
    public Mono<ResponseEntity<AuthResponse>> attempt(@RequestBody AuthRequest authRequest) {
        log.info("Authentication attempt { username: \"" + authRequest.getUsername() + "\" }");
        Mono<User> claimedUser = userService.findByUsername(authRequest.getUsername());
        return claimedUser.map((userDetails) -> {
            if (passwordEncoder.matches(authRequest.getPassword(), userDetails.getPassword())) {
                AuthResponse authResponse = new AuthResponse();
                authResponse.setToken(jwtUtil.generateToken(userDetails));
                log.info("Authentication attempt succeeded { username: \"" + authRequest.getUsername() + "\" }");
                return ResponseEntity.ok(authResponse);
            } else {
                log.info("Authentication attempt failed { username: \"" + authRequest.getUsername() + "\" }");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        });
    }
}