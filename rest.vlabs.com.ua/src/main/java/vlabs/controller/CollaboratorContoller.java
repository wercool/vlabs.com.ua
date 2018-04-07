package vlabs.controller;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.file.AccessDeniedException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.joda.time.DateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import vlabs.common.EmptyJsonResponse;
import vlabs.controller.exception.EntityAlreadyExistsException;
import vlabs.model.collaborator.Collaborator;
import vlabs.model.collaborator.CollaboratorProject;
import vlabs.model.collaborator.CollaboratorProjectWorkItem;
import vlabs.model.generic.VLabsFileItem;
import vlabs.model.user.User;
import vlabs.service.CollaboratorService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class CollaboratorContoller
{
    private static final Logger log = LoggerFactory.getLogger(CollaboratorContoller.class);

    @Value("${vlabs.dir.blender}")
    private String BLENDER;

    @Value("${vlabs.dir.blender_export}")
    private String VLABS_BLENDER_EXPORT_DIR;

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
    public CollaboratorProject addCollaboratorProjectWorkItem(@RequestBody CollaboratorProjectWorkItem collaboratorProjectWorkItem) throws SecurityException, EntityAlreadyExistsException {
        Collaborator collaborator = collaboratorService.findById(collaboratorProjectWorkItem.getCollaborator_id());
        CollaboratorProject collaboratorProject = collaboratorService.findCollaboratorProjectById(collaboratorProjectWorkItem.getProject_id());

        File collaboratorProjectWorkItemDir = new File(VLABS_COLLABORATOR_PROJECTS + "/" + collaboratorProject.getAlias() + "/" + collaborator.getAlias() + "/" + collaboratorProjectWorkItem.getAlias());

        if (collaboratorProjectWorkItemDir.exists()) {
            log.error("Colalborator Project with the alias = " + collaboratorProject.getAlias() + " already exists!");
            throw new EntityAlreadyExistsException("Colalborator Project Work Item with the alias = " + collaboratorProjectWorkItem.getAlias() + " already exists!", this.getClass().getName() + " " + Thread.currentThread().getStackTrace()[1].getMethodName());
        } else {
            System.out.println("creating directory: " + collaboratorProjectWorkItemDir.getPath());
            boolean result = false;

            try{
                collaboratorProjectWorkItemDir.mkdir();
                result = true;
            } 
            catch(SecurityException se) {
                log.info("Directory " + collaboratorProjectWorkItemDir.getName() + " can not be created because of: ");
                throw se;
            }
            if(result) {
                log.info("Directory " + collaboratorProjectWorkItemDir.getName() + " created");  
            }
        }
        return collaboratorService.addCollaboratorProjectWorkItem(collaboratorProjectWorkItem);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/collaborator/project/workitem/{collaboratorProjectWorkItemId}")
    public CollaboratorProjectWorkItem getCollaboratorProjectWorkItemsById(@PathVariable Long collaboratorProjectWorkItemId) {
        CollaboratorProjectWorkItem сollaboratorProjectWorkItem = collaboratorService.findCollaboratorProjectWorkItemsById(collaboratorProjectWorkItemId);

        CollaboratorProject collaboratorProject = collaboratorService.findCollaboratorProjectById(сollaboratorProjectWorkItem.getProject_id());

        Collaborator collaborator = collaboratorService.findById(сollaboratorProjectWorkItem.getCollaborator_id());
        File collaboratorProjectWorkItemDir = new File(VLABS_COLLABORATOR_PROJECTS + "/" + collaboratorProject.getAlias() + "/" + collaborator.getAlias() + "/" + сollaboratorProjectWorkItem.getAlias());

        List<VLabsFileItem> fileItems = new ArrayList<VLabsFileItem>();
        File[] collaboratorProjectWorkItemDirAllSubFiles = collaboratorProjectWorkItemDir.listFiles();
        for (File file : collaboratorProjectWorkItemDirAllSubFiles) {
            VLabsFileItem vLabsFileItem = new VLabsFileItem();
            vLabsFileItem.setName(file.getName());
            vLabsFileItem.setLastModified(file.lastModified());
            if(file.isDirectory())
            {
//                log.info(file.getName() + " is DIRECTORY");
                vLabsFileItem.setIsDirectory(true);
            }
            fileItems.add(vLabsFileItem);
        }

        сollaboratorProjectWorkItem.setFileItems(fileItems);
        return сollaboratorProjectWorkItem;
    }

    @RequestMapping(method = RequestMethod.POST, value= "/collaborator/project/workitem/upload/{collaboratorProjectWorkItemId}")
    public ResponseEntity<EmptyJsonResponse> workItemUpload(@RequestPart("file") MultipartFile workItemFile, @PathVariable Long collaboratorProjectWorkItemId) throws AccessDeniedException, IllegalStateException, IOException, InterruptedException {
        CollaboratorProjectWorkItem collaboratorProjectWorkItem = collaboratorService.findCollaboratorProjectWorkItemsById(collaboratorProjectWorkItemId);
        CollaboratorProject collaboratorProject = collaboratorService.findCollaboratorProjectById(collaboratorProjectWorkItem.getProject_id());

//        Collaborator collaborator = collaboratorService.findById(collaboratorProjectWorkItem.getCollaborator_id());

        User user = (User)SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
        if (user == null) {
            return new ResponseEntity<EmptyJsonResponse>(new EmptyJsonResponse(), HttpStatus.FORBIDDEN);
        }
        Collaborator collaborator  = collaboratorService.findByUserId(user.getId());

        File collaboratorProjectWorkItemDir = new File(VLABS_COLLABORATOR_PROJECTS + "/" + collaboratorProject.getAlias() + "/" + collaborator.getAlias() + "/" + collaboratorProjectWorkItem.getAlias());
        if (!collaboratorProjectWorkItemDir.exists()) {
            throw new AccessDeniedException("Work Item Directrory");
        }

        if (collaboratorProjectWorkItem.getType().equals("blender_model") 
         || collaboratorProjectWorkItem.getType().equals("vlab_item")) {
            FileUtils.cleanDirectory(collaboratorProjectWorkItemDir); 
        }

        File collaboratorProjectWorkItemPath = new File(VLABS_COLLABORATOR_PROJECTS + "/" + collaboratorProject.getAlias() + "/" + collaborator.getAlias() + "/" + collaboratorProjectWorkItem.getAlias() + "/" + workItemFile.getOriginalFilename());
        workItemFile.transferTo(collaboratorProjectWorkItemPath);

        if (collaboratorProjectWorkItem.getType().equals("blender_model") 
        || collaboratorProjectWorkItem.getType().equals("vlab_item")) {

            String unzipCMD = "/usr/bin/unzip " + collaboratorProjectWorkItemPath.getAbsolutePath() + " -d " + collaboratorProjectWorkItemDir.getAbsolutePath();
            log.info("Executing bash cmd:\n\n" + unzipCMD + "\n");
            Runtime rt = Runtime.getRuntime();
            Process proc = rt.exec(unzipCMD);
            InputStream stderr = proc.getErrorStream();
            InputStreamReader isr = new InputStreamReader(stderr);
            BufferedReader br = new BufferedReader(isr);
            String line = null;
            System.out.println("<ERROR>");
            while ( (line = br.readLine()) != null)
                System.out.println(line);
            System.out.println("</ERROR>");
            int exitVal = proc.waitFor();
            System.out.println("Process exitValue: " + exitVal);
            isr.close();
            br.close();

            if (collaboratorProjectWorkItem.getType().equals("blender_model")) {

                //Create 'result' dir
                File collaboratorProjectWorkItemResultDir = new File(VLABS_COLLABORATOR_PROJECTS + "/" + collaboratorProject.getAlias() + "/" + collaborator.getAlias() + "/" + collaboratorProjectWorkItem.getAlias() + "/result");
                collaboratorProjectWorkItemResultDir.mkdir();

                String blederFile = null;
                File[] collaboratorProjectWorkItemDirAllSubFiles = collaboratorProjectWorkItemDir.listFiles();
                for (File file : collaboratorProjectWorkItemDirAllSubFiles) {
                    if(!file.isDirectory())
                    {
                        if (file.getName().indexOf(".blend") > -1) {
                            blederFile = file.getName();
                            log.info("Blender file found: " + file.getName());
                        }
                    }
                }

                String JSONResultFile = blederFile.replaceAll(".blend", ".json");
                String JSONBlenderExportCMD = BLENDER + " " 
                                              + collaboratorProjectWorkItemDir.getAbsolutePath() + "/" 
                                              + blederFile + " --background --python " 
                                              + VLABS_BLENDER_EXPORT_DIR + "/vlab-export.py -- " 
                                              + collaboratorProjectWorkItemResultDir.getCanonicalPath() 
                                              + "/" + JSONResultFile;
                log.info("Executing bash cmd:\n\n" + JSONBlenderExportCMD + "\n");
                Process procExporter = rt.exec(JSONBlenderExportCMD);
//                InputStream stderrExporter = procExporter.getErrorStream();
//                InputStreamReader isrExporter = new InputStreamReader(stderrExporter);
//                BufferedReader brExporter = new BufferedReader(isrExporter);
//                line = null;
//                System.out.println("<ERROR>");
//                while ( (line = brExporter.readLine()) != null)
//                    System.out.println(line);
//                System.out.println("</ERROR>");
                exitVal = procExporter.waitFor();
                System.out.println("Process exitValue: " + exitVal);
//                isrExporter.close();
//                brExporter.close();
            }
       }

        collaboratorProjectWorkItem.setLastUpdateDate(new Timestamp(DateTime.now().getMillis()));

        collaboratorService.updateCollaboratorProjectWorkItem(collaboratorProjectWorkItem);

        return new ResponseEntity<EmptyJsonResponse>(new EmptyJsonResponse(), HttpStatus.OK);
    }
}
