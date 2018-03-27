package vlabs.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import vlabs.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long>
{
    User findByUsername(String username);

    @Query("SELECT u FROM User AS u WHERE u.authorities IS EMPTY")
    List<User> findAllWithoutAuthorities();

    @Query("SELECT u FROM User AS u WHERE u.authorities IS NOT EMPTY")
    List<User> findAllWithAuthorities();
}
