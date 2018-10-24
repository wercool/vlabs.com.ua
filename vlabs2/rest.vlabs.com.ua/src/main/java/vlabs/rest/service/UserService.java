package vlabs.rest.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import reactor.core.publisher.Mono;
import vlabs.rest.model.User;
import vlabs.rest.repository.mongo.UserRepository;

@Service
public class UserService {

    @SuppressWarnings("unused")
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired
    UserRepository userRepository;

    public Mono<User> findByUsername(String username) {
        return userRepository.findUserByUsername(username);
    }
}
