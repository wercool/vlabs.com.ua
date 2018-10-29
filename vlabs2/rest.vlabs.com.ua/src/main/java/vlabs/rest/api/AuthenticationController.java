package vlabs.rest.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;
import vlabs.rest.config.security.JWTTokenUtil;
import vlabs.rest.config.security.JWTUtil;
import vlabs.rest.config.security.PBKDF2Encoder;
import vlabs.rest.config.security.model.AuthRequest;
import vlabs.rest.config.security.model.AuthResponse;
import vlabs.rest.service.UserService;

@RestController
@RequestMapping(path = "/api/auth")
public class AuthenticationController {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationController.class);

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private JWTTokenUtil jwtTokenUtil;

    @Autowired
    private PBKDF2Encoder passwordEncoder;

    @Autowired
    private UserService userService;

    /**
     * Return Bearer token if authRequest credentials matches
     * @param authRequest
     * @return
     */
    @RequestMapping(value = "/attempt", method = RequestMethod.POST)
    public Mono<ResponseEntity<?>> attempt(@RequestBody AuthRequest authRequest) {
        return userService.findUserByUsername(authRequest.getUsername())
            .map((userDetails) -> {
                if (passwordEncoder.matches(authRequest.getPassword(), userDetails.getPassword())) {
                    AuthResponse authResponse = new AuthResponse();
//                    authResponse.setToken(jwtUtil.generateToken(userDetails));
                    authResponse.setToken(jwtTokenUtil.generateToken(userDetails));
                    log.info("Authentication attempt succeeded { username: \"" + authRequest.getUsername() + "\" }");
                    return ResponseEntity.ok(authResponse);
                } else {
                    log.info("Authentication attempt failed { username: \"" + authRequest.getUsername() + "\" }");
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
                }
            })
            .defaultIfEmpty(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @RequestMapping(value = "/details", method = RequestMethod.GET)
    @PreAuthorize("hasRole('USER')")
    public Mono<UserDetails> details() {
        return userService.getAuthenticatedUserDetails();
    }
}
