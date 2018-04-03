package vlabs.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vlabs.model.Course;
import vlabs.model.eclass.EClass;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long>
{
    Course findByName(String name);

    @Query("SELECT c.eClasses FROM Course AS c WHERE c.id = :courseId")
    List<EClass> findCourseEClasses(@Param("courseId") Long courseId);

    @Query("SELECT ec FROM EClass AS ec WHERE ec.id NOT IN (:courseEClassesIds)")
    List<EClass> findAllNonCourseEClasses(@Param("courseEClassesIds") List<Long> courseEClassesIds);
}
