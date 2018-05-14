package vlabs.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import vlabs.model.HelpClip;

@Repository
public interface HelpClipRepository  extends JpaRepository<HelpClip, Long> {

    HelpClip findByTitle(String title);
    HelpClip findByAlias(String alias);
}