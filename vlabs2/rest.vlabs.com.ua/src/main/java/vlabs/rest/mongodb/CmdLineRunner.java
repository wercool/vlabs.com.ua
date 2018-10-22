package vlabs.rest.mongodb;

import java.util.Arrays;
import java.util.Date;

import org.bson.types.ObjectId;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import reactor.core.publisher.Flux;
import vlabs.rest.model.User;
import vlabs.rest.repository.reactive.UserReactiveRepository;

@Component
public class CmdLineRunner {

    private final UserReactiveRepository userReactiveRepository;

    public CmdLineRunner(UserReactiveRepository userReactiveRepository) {
        Assert.notNull(userReactiveRepository, "userReactiveRepository cannot be null");
        this.userReactiveRepository = userReactiveRepository;
    }

    @Bean
    public CommandLineRunner initDatabase() {
        Flux<User> people = Flux.just(
                new User(new ObjectId(), "jdev", "Joe", "Developer", "dev@transempiric.com", "{noop}dev", Arrays.asList("ROLE_ADMIN"), true, new Date())
        );

        return args -> {
            this.userReactiveRepository.deleteAll().thenMany(userReactiveRepository.saveAll(people)).blockLast();
        };
    }
}
