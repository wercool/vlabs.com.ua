package vlabs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.UserMedia;

@Repository
public interface UserMediaRepository extends JpaRepository<UserMedia, Long>
{
}
