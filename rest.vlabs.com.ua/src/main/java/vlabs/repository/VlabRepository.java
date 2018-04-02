package vlabs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.Vlab;

@Repository
public interface VlabRepository extends JpaRepository<Vlab, Long>
{
    Vlab findByTitle(String title);
    Vlab findByAlias(String title);
}
