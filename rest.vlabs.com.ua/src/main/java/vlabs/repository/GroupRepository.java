package vlabs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.Group;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long>
{
    Group findByName(String name);
}
