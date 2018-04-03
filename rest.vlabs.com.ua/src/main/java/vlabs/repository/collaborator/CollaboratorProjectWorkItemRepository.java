package vlabs.repository.collaborator;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vlabs.model.collaborator.CollaboratorProjectWorkItem;

@Repository
public interface CollaboratorProjectWorkItemRepository extends JpaRepository<CollaboratorProjectWorkItem, Long>
{
    @Query("SELECT wi FROM CollaboratorProjectWorkItem AS wi WHERE wi.collaborator_id = :collaboratorId AND wi.project_id = :collaboratorProjectId")
    List<CollaboratorProjectWorkItem> getWorkItemsByCollaboratorIdAndProjectId(@Param("collaboratorId") Long collaboratorId, @Param("collaboratorProjectId") Long collaboratorProjectId);
}
