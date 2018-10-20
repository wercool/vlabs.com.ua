package vlabs.repository.collaborator;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vlabs.model.collaborator.Collaborator;

@Repository
public interface CollaboratorRepository extends JpaRepository<Collaborator, Long>
{
    Collaborator findByAlias(String title);

    @Query("SELECT c FROM Collaborator AS c WHERE c.user_id = :userId")
    Collaborator getOneByUserId(@Param("userId") Long userId);
}
