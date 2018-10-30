package vlabs.rest.api.http;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import reactor.core.publisher.Mono;
import vlabs.rest.config.security.CustomPasswordEncoder;
import vlabs.rest.config.security.JWTTokenUtil;
import vlabs.rest.config.security.model.JWTAuthenticationRequest;
import vlabs.rest.config.security.model.JWTAuthenticationResponse;
import vlabs.rest.service.UserService;

@RestController
@RequestMapping(path = "/api/auth")
public class AuthenticationController {

    private static final Logger log = LoggerFactory.getLogger(AuthenticationController.class);

    @Autowired
    private JWTTokenUtil jwtTokenUtil;

    @Autowired
    CustomPasswordEncoder customPasswordEncoder;

    @Autowired
    private UserService userService;

    @RequestMapping(value = "/token", method = RequestMethod.POST)
    public Mono<ResponseEntity<?>> token(@RequestBody JWTAuthenticationRequest authenticationRequest) throws AuthenticationException {
        return userService.findByUsername(authenticationRequest.getUsername())
               .map((userDetails) -> {
                   if (customPasswordEncoder.matches(authenticationRequest.getPassword(), userDetails.getPassword())) {
                       log.info("Authentication attempt succeeded { username: \"" + authenticationRequest.getUsername() + "\" }, token returned");
                       return ResponseEntity.ok(new JWTAuthenticationResponse(jwtTokenUtil.generateToken(userDetails), userDetails.getUsername()));
                   } else {
                       log.info("Authentication attempt failed { username: \"" + authenticationRequest.getUsername() + "\" }");
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
