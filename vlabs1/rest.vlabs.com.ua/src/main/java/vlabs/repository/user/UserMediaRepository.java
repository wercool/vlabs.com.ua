package vlabs.repository.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.user.UserMedia;

@Repository
public interface UserMediaRepository extends JpaRepository<UserMedia, Long>
{
}