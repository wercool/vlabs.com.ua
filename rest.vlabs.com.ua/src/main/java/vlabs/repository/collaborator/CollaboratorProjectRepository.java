package vlabs.repository.collaborator;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.collaborator.CollaboratorProject;


@Repository
public interface CollaboratorProjectRepository extends JpaRepository<CollaboratorProject, Long>
{
    CollaboratorProject findByName(String title);
    CollaboratorProject findByAlias(String title);
}
