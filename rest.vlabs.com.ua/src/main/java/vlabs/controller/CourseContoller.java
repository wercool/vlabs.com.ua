package vlabs.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import vlabs.model.Course;
import vlabs.model.EClass;
import vlabs.service.CourseService;

@RestController
@RequestMapping(value = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class CourseContoller
{
    @Autowired
    private CourseService courseService;

    @RequestMapping(method = RequestMethod.GET, value = "/course/{courseId}")
    public Course loadById(@PathVariable Long courseId) {
//        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
//        User user = (User)authentication.getPrincipal();
        return courseService.findById(courseId);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/course/add")
    public Course addNewCourse(@RequestBody Course course) {
        return courseService.addNew(course);
    }

    @RequestMapping(method = RequestMethod.GET, value= "/course/all")
    public List<Course> getAllCourses() {
        return courseService.findAll();
    }

    @RequestMapping(method = RequestMethod.POST, value= "/course/update")
    public Course updateFaculty(@RequestBody Course course) {
        return courseService.updateCourse(course);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/course/{courseId}/course-eclasses")
    public List<EClass> courseEClassesByCourseId(@PathVariable Long courseId) {
        return courseService.getCourseEClassesByCourseId(courseId);
    }

    @RequestMapping(method = RequestMethod.GET, value = "/course/{courseId}/non-course-eclasses")
    public List<EClass> nonCourseEClassesByCourseId(@PathVariable Long courseId) {
        return courseService.getNonCourseEClassesByCourseId(courseId);
    }

    @RequestMapping(method = RequestMethod.POST, value= "/course/{courseId}/addeclasses")
    public Course addCourseEClasses(@PathVariable Long courseId, @RequestBody List<EClass> newCourseEClasses) {
        return courseService.updateCourseEClasses(courseId, newCourseEClasses, "add");
    }

    @RequestMapping(method = RequestMethod.POST, value= "/course/{courseId}/removeeclasses")
    public Course removeCourseEClasses(@PathVariable Long courseId, @RequestBody List<EClass> removeCourseEClasses) {
        return courseService.updateCourseEClasses(courseId, removeCourseEClasses, "remove");
    }
}
