package vlabs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.model.Faculty;
import vlabs.model.Group;
import vlabs.service.FacultyService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class FacultyContoller
{
    @Autowired
    private FacultyService facultyService;

    @RequestMapping(method = RequestMethod.GET, value = "/faculty/{facultyId}")
    public Faculty loadById(@PathVariable Long facultyId) {
        return facultyService.findById(facultyId);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/faculty/add")
    public Faculty addNewFaculty(@RequestBody Faculty faculty) {
        return facultyService.addNew(faculty);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/faculty/all")
    public List<Faculty> getAllFaculties() {
        return facultyService.findAll();
    }
    
    @RequestMapping(method = RequestMethod.POST, value= "/faculty/update")
    public Faculty updateFaculty(@RequestBody Faculty faculty) {
        return facultyService.updateFaculty(faculty);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/faculty/{facultyId}/faculty-groups")
    public List<Group> groupMembersByGroupId(@PathVariable Long facultyId) {
        return facultyService.getFacultyGroupsByFacultyId(facultyId);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/faculty/{facultyId}/non-faculty-groups")
    public List<Group> nonGroupMembersByGroupId(@PathVariable Long facultyId) {
        return facultyService.nonFacultyGroupsByFacultyId(facultyId);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/faculty/{facultyId}/addgroups")
    public Faculty addFacultyGroup(@PathVariable Long facultyId, @RequestBody List<Group> newFacultyGroups) {
        return facultyService.updateFacultyGroups(facultyId, newFacultyGroups, "add");
    }

    @RequestMapping(method = RequestMethod.POST, value= "/faculty/{facultyId}/removegroups")
    public Faculty removeFacultyGroup(@PathVariable Long facultyId, @RequestBody List<Group> removeFacultyGroups) {
        return facultyService.updateFacultyGroups(facultyId, removeFacultyGroups, "remove");
    }
}
