package vlabs.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import vlabs.model.Vlab;

public interface VlabRepository extends JpaRepository<Vlab, Long>
{
    Vlab findByTitle(String title);
}
