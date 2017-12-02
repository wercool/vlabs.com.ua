package vlabs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.Course;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long>
{
    Course findByName(String name);
}
