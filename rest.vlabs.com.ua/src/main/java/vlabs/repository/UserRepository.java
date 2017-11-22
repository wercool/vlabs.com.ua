package vlabs.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import vlabs.model.User;

public interface UserRepository extends JpaRepository<User, Long>
{
    User findByUsername(String username);

    @Query("SELECT u FROM User u WHERE u.authorities IS EMPTY")
    List<User> findAllWithoutAuthorities();
}
