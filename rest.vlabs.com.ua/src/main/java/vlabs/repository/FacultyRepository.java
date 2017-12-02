package vlabs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.Faculty;

@Repository
public interface FacultyRepository extends JpaRepository<Faculty, Long>
{
    Faculty findByTitle(String title);
}
