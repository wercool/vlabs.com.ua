package vlabs.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.Course;
import vlabs.repository.CourseRepository;

@Service
public class CourseService
{
    @Autowired
    private CourseRepository courseRepository;

    public Course findById(Long id) throws AccessDeniedException {
        Course course = courseRepository.getOne(id);
        return course;
    }

    public Course findByName(String name) throws AccessDeniedException {
        Course course = courseRepository.findByName(name);
        return course;
    }

    public List<Course> findAll() throws AccessDeniedException {
        List<Course> courses = courseRepository.findAll();
        return courses;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Course addNew(Course course) throws AccessDeniedException {
        return courseRepository.save(course);
    }
}
