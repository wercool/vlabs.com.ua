package vlabs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.model.EClass;
import vlabs.service.EClassService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class EClassContoller
{
    @Autowired
    private EClassService eclassService;

    @RequestMapping(method = RequestMethod.POST, value= "/eclass/add")
    public EClass addNewEClass(@RequestBody EClass eclass) {
        return eclassService.addNew(eclass);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/eclass/all")
    public List<EClass> getAllEClasses() {
        return eclassService.findAll();
    }
}
