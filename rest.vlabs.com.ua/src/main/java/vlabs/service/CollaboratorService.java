package vlabs.service;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.joda.time.DateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.collaborator.Collaborator;
import vlabs.model.collaborator.CollaboratorProject;
import vlabs.model.collaborator.CollaboratorProjectWorkItem;
import vlabs.repository.collaborator.CollaboratorProjectRepository;
import vlabs.repository.collaborator.CollaboratorProjectWorkItemRepository;
import vlabs.repository.collaborator.CollaboratorRepository;


@Service
public class CollaboratorService
{
    @Autowired
    private CollaboratorRepository collaboratorRepository;

    @Autowired
    private CollaboratorProjectRepository collaboratorProjectRepository;

    @Autowired
    private CollaboratorProjectWorkItemRepository collaboratorProjectWorkItemRepository;

    public Collaborator findById(Long id) throws AccessDeniedException {
        Collaborator collaborator = collaboratorRepository.getOne(id);
        return collaborator;
    }

    public Collaborator findByUserId(Long userId) throws AccessDeniedException {
        Collaborator collaborator = collaboratorRepository.getOneByUserId(userId);
        return collaborator;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public List<Collaborator> findAll() throws AccessDeniedException {
        List<Collaborator> collaborators = collaboratorRepository.findAll();
        return collaborators;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Collaborator addNew(Collaborator collaborator) throws AccessDeniedException {
        return collaboratorRepository.save(collaborator);
    }

    public Collaborator updateCollaborator(Collaborator collaborator) throws AccessDeniedException {
        return collaboratorRepository.save(collaborator);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public List<CollaboratorProject> findAllCollaboratorProjects() throws AccessDeniedException {
        List<CollaboratorProject> collaboratorProjects = collaboratorProjectRepository.findAll();
        return collaboratorProjects;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public CollaboratorProject addNewCollaboratorProject(CollaboratorProject collaboratorProject) throws AccessDeniedException {
        return collaboratorProjectRepository.save(collaboratorProject);
    }

    public CollaboratorProject findCollaboratorProjectByAlias(String alias) throws AccessDeniedException {
        CollaboratorProject collaboratorProject = collaboratorProjectRepository.findByAlias(alias);
        return collaboratorProject;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public List<CollaboratorProject> findAllNonCollaboratorProjectsByCollabortorId(Long collaboratorId) throws AccessDeniedException {
        List<CollaboratorProject> collaboratorProjects = collaboratorProjectRepository.findCollaboratorProjects(collaboratorId);
        List<Long> collaboratorProjectsIds = new ArrayList<Long>();
        for (CollaboratorProject p : collaboratorProjects) {
            collaboratorProjectsIds.add(p.getId());
        }

        List<CollaboratorProject> allNonCollaboratorProjects = new ArrayList<CollaboratorProject>();
        if (collaboratorProjectsIds.size() > 0) {
            allNonCollaboratorProjects = collaboratorProjectRepository.findAllNonCollaboratorProjects(collaboratorProjectsIds);
        } else {
            allNonCollaboratorProjects = collaboratorProjectRepository.findAll();
        }
        

        List<CollaboratorProject> potentialCollaboratorProjects = new ArrayList<CollaboratorProject>();
        for (CollaboratorProject p : allNonCollaboratorProjects) {
            potentialCollaboratorProjects.add(p);
        }

        return potentialCollaboratorProjects;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Collaborator updateCollaboratorProjects(Long collaboratorId, List<CollaboratorProject> modifiedCollaboratorProjects, String action) throws AccessDeniedException {
        Collaborator existingCollaborator = collaboratorRepository.getOne(collaboratorId);
        List<CollaboratorProject> collaboratorProjects = existingCollaborator.getProjects();

        if (action.equals("add")) {
            collaboratorProjects.addAll(modifiedCollaboratorProjects);
            existingCollaborator.setProjects(collaboratorProjects);
        }

        if (action.equals("remove")) {
            //TODO: why groupMembers.removeAll(modifiedGroupMembers) is not working here?!!!!
            List<Long> collaboratorProjectsToRemoveIds = new ArrayList<Long>();
            List<CollaboratorProject> udatedCollaboratorProjects = new ArrayList<CollaboratorProject>();
            for (CollaboratorProject cp : modifiedCollaboratorProjects) {
                collaboratorProjectsToRemoveIds.add(cp.getId());
            }
            for (CollaboratorProject cp : collaboratorProjects) {
                if (collaboratorProjectsToRemoveIds.indexOf(cp.getId()) == -1) {
                    udatedCollaboratorProjects.add(cp);
                }
            }
            existingCollaborator.setProjects(udatedCollaboratorProjects);
        }

        return collaboratorRepository.save(existingCollaborator);
    }

    public CollaboratorProject findCollaboratorProjectById(Long collaboratorProjectId) throws AccessDeniedException {
        CollaboratorProject collaboratorProject = collaboratorProjectRepository.getOne(collaboratorProjectId);
        return collaboratorProject;
    }

    public List<CollaboratorProjectWorkItem> findCollaboratorProjectWorkItemsByCollaboratorIdAndProjectId(Long collaboratorId, Long collaboratorProjectId) throws AccessDeniedException {
        List<CollaboratorProjectWorkItem> collaboratorProjectWorkItems = collaboratorProjectWorkItemRepository.getWorkItemsByCollaboratorIdAndProjectId(collaboratorId, collaboratorProjectId);
        return collaboratorProjectWorkItems;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('COLLABORATOR')")
    public CollaboratorProject addCollaboratorProjectWorkItem(CollaboratorProjectWorkItem collaboratorProjectWorkItem) throws AccessDeniedException {
        Timestamp now = new Timestamp(DateTime.now().getMillis());
        collaboratorProjectWorkItem.setLastUpdateDate(now);
        collaboratorProjectWorkItemRepository.save(collaboratorProjectWorkItem);
        return collaboratorProjectRepository.getOne(collaboratorProjectWorkItem.getProject_id());
    }

}
