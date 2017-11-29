package external.valterik.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import external.valterik.model.RightArmIK;

@Repository
public interface RightArmIKRepository extends JpaRepository<RightArmIK, Long>
{
    
}
