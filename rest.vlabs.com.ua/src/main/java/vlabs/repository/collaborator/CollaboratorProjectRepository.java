package vlabs.repository.collaborator;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vlabs.model.collaborator.CollaboratorProject;


@Repository
public interface CollaboratorProjectRepository extends JpaRepository<CollaboratorProject, Long>
{
    CollaboratorProject findByName(String title);
    CollaboratorProject findByAlias(String title);

    @Query("SELECT c.projects FROM Collaborator AS c WHERE c.id = :collaboratorId")
    List<CollaboratorProject> findCollaboratorProjects(@Param("collaboratorId") Long collaboratorId);

    @Query("SELECT cp FROM CollaboratorProject AS cp WHERE cp.id NOT IN (:collaboratorProjectsIds)")
    List<CollaboratorProject> findAllNonCollaboratorProjects(@Param("collaboratorProjectsIds") List<Long> collaboratorProjectsIds);
}
