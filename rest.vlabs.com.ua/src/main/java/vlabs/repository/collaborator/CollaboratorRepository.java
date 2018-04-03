package vlabs.repository.collaborator;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.collaborator.Collaborator;

@Repository
public interface CollaboratorRepository extends JpaRepository<Collaborator, Long>
{
    Collaborator findByAlias(String title);
}
