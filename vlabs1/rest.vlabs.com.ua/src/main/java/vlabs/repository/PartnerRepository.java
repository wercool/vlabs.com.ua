package vlabs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.Partner;

@Repository
public interface PartnerRepository extends JpaRepository<Partner, Long>
{
    Partner findByName(String title);
}
