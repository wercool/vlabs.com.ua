package vlabs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.collaborator.Collaborator;
import vlabs.model.collaborator.CollaboratorProject;
import vlabs.repository.collaborator.CollaboratorProjectRepository;
import vlabs.repository.collaborator.CollaboratorRepository;


@Service
public class CollaboratorService
{
    @Autowired
    private CollaboratorRepository collaboratorRepository;

    @Autowired
    private CollaboratorProjectRepository collaboratorProjectRepository;

    public Collaborator findById(Long id) throws AccessDeniedException {
        Collaborator collaborator = collaboratorRepository.getOne(id);
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

    public void updateCollaborator(Collaborator collaborator) throws AccessDeniedException {
        collaboratorRepository.save(collaborator);
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

}
