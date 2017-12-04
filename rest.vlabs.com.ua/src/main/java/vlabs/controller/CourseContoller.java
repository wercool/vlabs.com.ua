package vlabs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.model.Course;
import vlabs.service.CourseService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class CourseContoller
{
    @Autowired
    private CourseService courseService;

    @RequestMapping(method = RequestMethod.POST, value= "/course/add")
    public Course addNewCourse(@RequestBody Course course) {
        return courseService.addNew(course);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/course/all")
    public List<Course> getAllCourses() {
        return courseService.findAll();
    }
}
