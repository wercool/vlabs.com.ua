package vlabs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.EClassStructure;

@Repository
public interface EClassStructureRepository extends JpaRepository<EClassStructure, Long>
{
    EClassStructure findOneByEclassIdAndFormatId(Long eClassId, Long formatId);
}
