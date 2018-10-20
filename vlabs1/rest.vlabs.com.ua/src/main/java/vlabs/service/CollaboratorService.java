package vlabs.service;

import java.io.File;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

    private static final Logger log = LoggerFactory.getLogger(CollaboratorService.class);

    @Value("${vlabs.dir.collaborators.projects}")
    private String VLABS_COLLABORATOR_PROJECTS;

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

    public List<Collaborator> findAll() throws AccessDeniedException {
        List<Collaborator> collaborators = collaboratorRepository.findAll();
        return collaborators;
    }

    public Collaborator addNew(Collaborator collaborator) throws AccessDeniedException {
        return collaboratorRepository.save(collaborator);
    }

    public Collaborator updateCollaborator(Collaborator collaborator) throws AccessDeniedException {
        return collaboratorRepository.save(collaborator);
    }

    public List<CollaboratorProject> findAllCollaboratorProjects() throws AccessDeniedException {
        List<CollaboratorProject> collaboratorProjects = collaboratorProjectRepository.findAll();
        return collaboratorProjects;
    }

    public CollaboratorProject addNewCollaboratorProject(CollaboratorProject collaboratorProject) throws AccessDeniedException {
        return collaboratorProjectRepository.save(collaboratorProject);
    }

    public CollaboratorProject findCollaboratorProjectByAlias(String alias) throws AccessDeniedException {
        CollaboratorProject collaboratorProject = collaboratorProjectRepository.findByAlias(alias);
        return collaboratorProject;
    }

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

    public Collaborator updateCollaboratorProjects(Long collaboratorId, List<CollaboratorProject> modifiedCollaboratorProjects, String action) throws SecurityException, AccessDeniedException {
        Collaborator existingCollaborator = collaboratorRepository.getOne(collaboratorId);
        List<CollaboratorProject> collaboratorProjects = existingCollaborator.getProjects();

        if (action.equals("add")) {
            collaboratorProjects.addAll(modifiedCollaboratorProjects);
            existingCollaborator.setProjects(collaboratorProjects);

            collaboratorProjects = existingCollaborator.getProjects();

            for (CollaboratorProject collaboratorProject : collaboratorProjects) {
                File collaboratorAliasedProjectDir = new File(VLABS_COLLABORATOR_PROJECTS + "/" + collaboratorProject.getAlias() + "/" + existingCollaborator.getAlias());
                if (!collaboratorAliasedProjectDir.exists()) {
                    System.out.println("creating directory: " + collaboratorAliasedProjectDir.getPath());
                    boolean result = false;

                    try{
                        collaboratorAliasedProjectDir.mkdir();
                        result = true;
                    } 
                    catch(SecurityException se) {
                        log.info("Directory " + collaboratorAliasedProjectDir.getName() + " can not be created because of: ");
                        throw se;
                    }
                    if(result) {
                        log.info("Directory " + collaboratorAliasedProjectDir.getName() + " created");  
                    }
                } else {
                    System.out.println("directory already exists: " + collaboratorAliasedProjectDir.getPath());
                }
            }
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

    public List<CollaboratorProjectWorkItem> findAllCollaboratorWorkItems() throws AccessDeniedException {
        return collaboratorProjectWorkItemRepository.findAll();
    }

    public CollaboratorProject findCollaboratorProjectById(Long collaboratorProjectId) throws AccessDeniedException {
        CollaboratorProject collaboratorProject = collaboratorProjectRepository.getOne(collaboratorProjectId);
        return collaboratorProject;
    }

    public List<CollaboratorProjectWorkItem> findCollaboratorProjectWorkItemsByCollaboratorIdAndProjectId(Long collaboratorId, Long collaboratorProjectId) throws AccessDeniedException {
        List<CollaboratorProjectWorkItem> collaboratorProjectWorkItems = collaboratorProjectWorkItemRepository.getWorkItemsByCollaboratorIdAndProjectId(collaboratorId, collaboratorProjectId);
        return collaboratorProjectWorkItems;
    }

    public CollaboratorProject addCollaboratorProjectWorkItem(CollaboratorProjectWorkItem collaboratorProjectWorkItem) throws AccessDeniedException {
        Timestamp now = new Timestamp(DateTime.now().getMillis());
        collaboratorProjectWorkItem.setLastUpdateDate(now);
        collaboratorProjectWorkItemRepository.save(collaboratorProjectWorkItem);
        return collaboratorProjectRepository.getOne(collaboratorProjectWorkItem.getProject_id());
    }

    public CollaboratorProjectWorkItem findCollaboratorProjectWorkItemsById(Long collaboratorProjectWorkItemId) throws AccessDeniedException {
        CollaboratorProjectWorkItem collaboratorProjectWorkItem = collaboratorProjectWorkItemRepository.getOne(collaboratorProjectWorkItemId);
        return collaboratorProjectWorkItem;
    }

    public CollaboratorProjectWorkItem updateCollaboratorProjectWorkItem(CollaboratorProjectWorkItem collaboratorProjectWorkItem) throws AccessDeniedException {
        return collaboratorProjectWorkItemRepository.save(collaboratorProjectWorkItem);
    }

}
