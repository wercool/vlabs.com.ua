package vlabs.rest.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;


import reactor.core.publisher.Mono;
import vlabs.rest.mongodb.repository.UserReactiveRepository;

@Service
public class CustomReactiveUserDetailsService implements ReactiveUserDetailsService {

    @Autowired public UserReactiveRepository userReactiveRepository;

    @Override
    public Mono<UserDetails> findByUsername(String username) {
        Mono<UserDetails> data = userReactiveRepository.findByUsername(username);
        return data;
    }
}
