package vlabs.repository.valterik;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.valterik.RightArmIK;

@Repository
public interface RightArmIKRepository extends JpaRepository<RightArmIK, Long>
{
    
}
