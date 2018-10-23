package vlabs.rest.api;

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

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private PBKDF2Encoder passwordEncoder;

    @Autowired
    private UserService userRepository;

    @RequestMapping(value = "/token", method = RequestMethod.POST)
    public Mono<ResponseEntity<AuthResponse>> auth(@RequestBody AuthRequest ar) {
        Mono<User> hypotheticalUser = userRepository.findByUsername(ar.getUsername());
        return hypotheticalUser.map((userDetails) -> {
            if (passwordEncoder.encode(ar.getPassword()).equals(userDetails.getPassword())) {
                AuthResponse authResponse = new AuthResponse();
                authResponse.setToken(jwtUtil.generateToken(userDetails));
                return ResponseEntity.ok(authResponse);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        });
    }

}
