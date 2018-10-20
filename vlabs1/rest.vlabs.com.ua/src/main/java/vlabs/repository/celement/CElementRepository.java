package vlabs.repository.celement;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.celement.CElement;

@Repository
public interface CElementRepository extends JpaRepository<CElement, Long>
{

}
