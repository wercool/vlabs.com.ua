package vlabs.repository.eclass;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.eclass.EClass;

@Repository
public interface EClassRepository extends JpaRepository<EClass, Long>
{
    EClass findByTitle(String title);
    List<EClass> findAllByOrderByIdAsc();
    List<EClass> findAllByOrderByIdDesc();
}
