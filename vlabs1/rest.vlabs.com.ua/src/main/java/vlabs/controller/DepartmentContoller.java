package vlabs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.model.Department;
import vlabs.service.DepartmentService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class DepartmentContoller
{
    @Autowired
    private DepartmentService departmentService;

    @RequestMapping(method = RequestMethod.POST, value= "/department/add")
    public Department addNewDepartment(@RequestBody Department department) {
        return departmentService.addNew(department);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/department/all")
    public List<Department> getAllDepartments() {
        return departmentService.findAll();
    }
}
