package vlabs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.model.Module;
import vlabs.service.ModuleService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class ModuleContoller
{
    @Autowired
    private ModuleService moduleService;

    @RequestMapping(method = RequestMethod.POST, value= "/module/add")
    public Module addNewModule(@RequestBody Module module) {
        return moduleService.addNew(module);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/module/all")
    public List<Module> getAllModules() {
        return moduleService.findAll();
    }
}
