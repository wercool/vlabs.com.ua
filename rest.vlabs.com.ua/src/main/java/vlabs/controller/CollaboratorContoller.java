package vlabs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.model.collaborator.Collaborator;
import vlabs.model.collaborator.CollaboratorProject;
import vlabs.service.CollaboratorService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class CollaboratorContoller
{
    @Autowired
    private CollaboratorService collaboratorService;

    @RequestMapping(method = RequestMethod.POST, value= "/collaborator/add")
    public Collaborator addNewCollaborator(@RequestBody Collaborator collaborator) {
        return collaboratorService.addNew(collaborator);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/collaborator/all")
    public List<Collaborator> getAllCollaborators() {
        return collaboratorService.findAll();
    }

    @RequestMapping(method = RequestMethod.GET, value= "/collaborator/project/all")
    public List<CollaboratorProject> getAllCollaboratorProjects() {
        return collaboratorService.findAllCollaboratorProjects();
    }

    @RequestMapping(method = RequestMethod.POST, value= "/collaborator/project/add")
    public CollaboratorProject addNewCollaboratorProject(@RequestBody CollaboratorProject collaboratorProject) {
        return collaboratorService.addNewCollaboratorProject(collaboratorProject);
    }
}
