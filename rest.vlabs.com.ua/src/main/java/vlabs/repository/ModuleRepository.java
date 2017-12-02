package vlabs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.Module;

@Repository
public interface ModuleRepository extends JpaRepository<Module, Long>
{
    Module findByTitle(String title);
}
