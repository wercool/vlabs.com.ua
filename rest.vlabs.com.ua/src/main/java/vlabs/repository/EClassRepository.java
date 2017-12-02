package vlabs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.EClass;

@Repository
public interface EClassRepository extends JpaRepository<EClass, Long>
{
    EClass findByTitle(String title);
}
