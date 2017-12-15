package vlabs.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.CElementItem;

@Repository
public interface CElementItemRepository extends JpaRepository<CElementItem, Long>
{
    List<CElementItem> findAllByCelementId(Long cElementId);
}
