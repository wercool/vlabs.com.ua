package vlabs.rest.repository.reactive;

import org.bson.types.ObjectId;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import reactor.core.publisher.Mono;
import vlabs.rest.model.User;

@Repository
public interface UserReactiveRepository extends ReactiveCrudRepository<User, ObjectId> {
    Mono<UserDetails> findByUsername(String username);
    Mono<User> findUserByUsername(String username);
}
