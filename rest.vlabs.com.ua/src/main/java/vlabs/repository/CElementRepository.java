package vlabs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.CElement;

@Repository
public interface CElementRepository extends JpaRepository<CElement, Long>
{

}
