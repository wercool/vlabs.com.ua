package vlabs.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vlabs.model.Faculty;
import vlabs.model.Group;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long>
{
    Faculty findByTitle(String title);

    @Query("SELECT f.groups FROM Faculty AS f WHERE f.id = :facultyId")
    List<Group> findFacultyGroups(@Param("facultyId") Long facultyId);

    @Query("SELECT g FROM Group AS g WHERE g.id NOT IN (:facultyGroupsIds)")
    List<Group> findAllNonFacultyGroups(@Param("facultyGroupsIds") List<Long> facultyGroupsIds);

}
