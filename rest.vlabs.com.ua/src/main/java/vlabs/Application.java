package vlabs;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@ComponentScan
@EnableAutoConfiguration (exclude = { DataSourceAutoConfiguration.class })
@EnableWebSecurity
@SpringBootApplication
public class Application
{
    private static final Logger log = LoggerFactory.getLogger(Application.class);

    public static void main(String[] args)
    {
        log.info("VLabs REST server initialization...");

        Resource resource = new ClassPathResource("application.properties");
        Properties prop = new Properties();
        try {
            prop.load(resource.getInputStream());
            String VLABS_HOME = prop.getProperty("vlabs.dir.home");
            log.info("vlabs.home = " + VLABS_HOME);

            File VLabsHomeDir = new File(VLABS_HOME);
            boolean VLabsHomeDirExists = VLabsHomeDir.exists();

            if (!VLabsHomeDirExists) {
                log.error("Obligatory directory " + VLABS_HOME + " does not exist");
                System.exit(0);
            }

        } catch (FileNotFoundException e) {
            e.printStackTrace();
        } catch (IOException e) {
            e.printStackTrace();
        }

        SpringApplication.run(Application.class, args);
        log.info("VLabs REST server is up and running");
    }
}
