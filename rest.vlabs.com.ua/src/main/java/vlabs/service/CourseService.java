package vlabs.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import vlabs.model.Course;
import vlabs.model.EClass;
import vlabs.repository.CourseRepository;
import vlabs.repository.EClassRepository;

@Service
public class CourseService
{
    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private EClassRepository eClassRepository;

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

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Course updateCourse(Course course) throws AccessDeniedException {
        Course existingCourse = courseRepository.getOne(course.getId());
        existingCourse.setName(course.getName());

        return courseRepository.save(existingCourse);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public List<EClass> getCourseEClassesByCourseId(Long courseId) throws AccessDeniedException {
        List<EClass> courseEClasses = courseRepository.findCourseEClasses(courseId);

        return courseEClasses;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public List<EClass> getNonCourseEClassesByCourseId(Long courseId) throws AccessDeniedException {
        List<EClass> courseEClasses = courseRepository.findCourseEClasses(courseId);
        List<Long> courseEClassesIds = new ArrayList<Long>();
        for (EClass ec : courseEClasses) {
            courseEClassesIds.add(ec.getId());
        }

        List<EClass> allNonCourseEClasses = new ArrayList<EClass>();
        if (courseEClassesIds.size() > 0) {
            allNonCourseEClasses = courseRepository.findAllNonCourseEClasses(courseEClassesIds);
        } else {
            allNonCourseEClasses = eClassRepository.findAll();
        }
        

        List<EClass> potentialCourseEClasses = new ArrayList<EClass>();
        for (EClass ec : allNonCourseEClasses) {
            potentialCourseEClasses.add(ec);
        }

        return potentialCourseEClasses;
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Course updateCourseEClasses(Long courseId, List<EClass> modifiedCourseEClasses, String action) throws AccessDeniedException {
        Course existingCourse = courseRepository.getOne(courseId);
        List<EClass> courseEClasses = existingCourse.geteClasses();

        if (action.equals("add")) {
            courseEClasses.addAll(modifiedCourseEClasses);
            existingCourse.seteClasses(courseEClasses);
        }

        if (action.equals("remove")) {
            List<Long> courseEClassesToRemoveIds = new ArrayList<Long>();
            List<EClass> udatedCourseEClasses = new ArrayList<EClass>();
            for (EClass ec : modifiedCourseEClasses) {
                courseEClassesToRemoveIds.add(ec.getId());
            }
            for (EClass ec : courseEClasses) {
                if (courseEClassesToRemoveIds.indexOf(ec.getId()) == -1) {
                    udatedCourseEClasses.add(ec);
                }
            }
            existingCourse.seteClasses(udatedCourseEClasses);
        }

        return courseRepository.save(existingCourse);
    }
}
