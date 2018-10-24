package vlabs.rest.repository.mongo;

import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import reactor.core.publisher.Mono;
import vlabs.rest.model.User;

@Repository
public interface UserRepository extends ReactiveMongoRepository<User, String> {
    Mono<UserDetails> findByUsername(String username);
    Mono<User> findUserByUsername(String username);
}
