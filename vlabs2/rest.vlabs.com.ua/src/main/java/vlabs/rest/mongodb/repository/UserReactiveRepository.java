package vlabs.rest.mongodb.repository;

import org.bson.types.ObjectId;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import reactor.core.publisher.Mono;
import vlabs.rest.model.user.User;

@Repository
public interface UserReactiveRepository extends ReactiveCrudRepository<User, ObjectId> {
    Mono<UserDetails> findByUsername(String username);
    Mono<User> findUserByUsername(String username);
}
