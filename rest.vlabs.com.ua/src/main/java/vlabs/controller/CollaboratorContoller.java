package vlabs.controller;

import java.io.File;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.controller.exception.EntityAlreadyExistsException;
import vlabs.model.collaborator.Collaborator;
import vlabs.model.collaborator.CollaboratorProject;
import vlabs.model.collaborator.CollaboratorProjectWorkItem;
import vlabs.service.CollaboratorService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class CollaboratorContoller
{
    private static final Logger log = LoggerFactory.getLogger(CollaboratorContoller.class);

    @Value("${vlabs.dir.collaborators.projects}")
    private String VLABS_COLLABORATOR_PROJECTS;

    @Autowired
    private CollaboratorService collaboratorService;

    @RequestMapping(method = RequestMethod.GET, value = "/collaborator/{collaboratorId}")
    public Collaborator loadById(@PathVariable Long collaboratorId) {
        return collaboratorService.findById(collaboratorId);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/collaborator/user/{userId}")
    public Collaborator loadByUserIdId(@PathVariable Long userId) {
        return collaboratorService.findByUserId(userId);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/collaborator/add")
    public Collaborator addNewCollaborator(@RequestBody Collaborator collaborator) {
        return collaboratorService.addNew(collaborator);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/collaborator/update")
    public Collaborator updateCollaborator(@RequestBody Collaborator collaborator) {
        //TODO: update respective folder by alias if alias is being changed in update
        return collaboratorService.updateCollaborator(collaborator);
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
    public CollaboratorProject addNewCollaboratorProject(@RequestBody CollaboratorProject collaboratorProject) throws SecurityException, EntityAlreadyExistsException {

        CollaboratorProject existingCollaboratorProjectByAlias = collaboratorService.findCollaboratorProjectByAlias(collaboratorProject.getAlias());

        if (existingCollaboratorProjectByAlias != null) {
            log.error("Colalborator Project with the alias = " + collaboratorProject.getAlias() + " already exists!");
            throw new EntityAlreadyExistsException("Colalborator Project with the alias = " + collaboratorProject.getAlias() + " already exists!", this.getClass().getName() + " " + Thread.currentThread().getStackTrace()[1].getMethodName());
        }

        File collaboratorProjectDir = new File(VLABS_COLLABORATOR_PROJECTS + "/" + collaboratorProject.getAlias());
        if (!collaboratorProjectDir.exists()) {
            System.out.println("creating directory: " + collaboratorProjectDir.getName());
            boolean result = false;

            try{
                collaboratorProjectDir.mkdir();
                result = true;
            } 
            catch(SecurityException se) {
                log.info("Directory " + collaboratorProjectDir.getName() + " can not be created because of: ");
                throw se;
            }
            if(result) {
                log.info("Directory " + collaboratorProjectDir.getName() + " created");  
            }
        }

        return collaboratorService.addNewCollaboratorProject(collaboratorProject);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/collaborator/project/{collaboratorId}/non-collaborator-projects")
    public List<CollaboratorProject> getAllNonCollaboratorProjects(@PathVariable Long collaboratorId) {
        return collaboratorService.findAllNonCollaboratorProjectsByCollabortorId(collaboratorId);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/collaborator/project/{collaboratorId}/addprojects")
    public Collaborator addCollaboratorProjects(@PathVariable Long collaboratorId, @RequestBody List<CollaboratorProject> newCollaboratorProjects) {
        return collaboratorService.updateCollaboratorProjects(collaboratorId, newCollaboratorProjects, "add");
    }

    @RequestMapping(method = RequestMethod.POST, value= "/collaborator/project/{collaboratorId}/removeprojects")
    public Collaborator removeGroupMembers(@PathVariable Long collaboratorId, @RequestBody List<CollaboratorProject> removeCollaboratorProjects) {
        return collaboratorService.updateCollaboratorProjects(collaboratorId, removeCollaboratorProjects, "remove");
    }

    @RequestMapping(method = RequestMethod.GET, value= "/collaborator/project/{collaboratorProjectId}")
    public CollaboratorProject getCollaboratorProjectById(@PathVariable Long collaboratorProjectId) {
        return collaboratorService.findCollaboratorProjectById(collaboratorProjectId);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/collaborator/project/workitems/{collaboratorId}/{collaboratorProjectId}")
    public List<CollaboratorProjectWorkItem> getCollaboratorProjectWorkItemsByCollaboratorIdAndProjectId(@PathVariable Long collaboratorId, @PathVariable Long collaboratorProjectId) {
        return collaboratorService.findCollaboratorProjectWorkItemsByCollaboratorIdAndProjectId(collaboratorId, collaboratorProjectId);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/collaborator/project/workitem/add")
    public CollaboratorProject addCollaboratorProjectWorkItem(@RequestBody CollaboratorProjectWorkItem collaboratorProjectWorkItem) {
        return collaboratorService.addCollaboratorProjectWorkItem(collaboratorProjectWorkItem);
    }
}
