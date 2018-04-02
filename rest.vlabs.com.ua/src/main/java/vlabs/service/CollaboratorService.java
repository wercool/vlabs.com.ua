package vlabs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.Collaborator;
import vlabs.repository.CollaboratorRepository;


@Service
public class CollaboratorService
{
    @Autowired
    private CollaboratorRepository collaboratorRepository;

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
}
