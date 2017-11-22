package vlabs.common;

import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.Date;

@SuppressWarnings("serial")
@Component
public class TimeProvider implements Serializable
{
    public Date now() {
        return new Date();
    }
}