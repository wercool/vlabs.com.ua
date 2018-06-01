package vlabs.repository.helpclip;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import vlabs.model.helpclip.HelpClip;

@Repository
public interface HelpClipRepository  extends JpaRepository<HelpClip, Long> {

    HelpClip findByTitle(String title);
    HelpClip findByAlias(String alias);

    @Query("SELECT hc FROM HelpClip AS hc WHERE hc.id IN (:helpClipsIds)")
    List<HelpClip> findAllByIdList(@Param("helpClipsIds") List<Long> helpClipsIds);

    @Query("SELECT hc FROM HelpClip AS hc WHERE hc.id NOT IN (:helpClipsIds)")
    List<HelpClip> findAllByNotIdList(@Param("helpClipsIds") List<Long> helpClipsIds);
}