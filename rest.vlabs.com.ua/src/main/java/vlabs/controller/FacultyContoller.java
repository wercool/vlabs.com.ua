package vlabs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.model.Faculty;
import vlabs.service.FacultyService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class FacultyContoller
{
    @Autowired
    private FacultyService facultyService;

    @RequestMapping(method = RequestMethod.POST, value= "/faculty/add")
    public Faculty addNewFaculty(@RequestBody Faculty faculty) {
        return facultyService.addNew(faculty);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/faculty/all")
    public List<Faculty> getAllFaculties() {
        return facultyService.findAll();
    }
}
