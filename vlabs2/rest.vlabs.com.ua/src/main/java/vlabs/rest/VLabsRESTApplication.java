package vlabs.rest;

import java.io.IOException;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

@SpringBootApplication
@ComponentScan
public class VLabsRESTApplication {
    private static final Logger log = LoggerFactory.getLogger(VLabsRESTApplication.class);

    public static void main(String[] args) {
        Resource resource = new ClassPathResource("application.properties");
        Properties properties = new Properties();
        try {
            properties.load(resource.getInputStream());
            String projectTitle = properties.getProperty("project.title");

            SpringApplication.run(VLabsRESTApplication.class, args);
            log.info(projectTitle + " is up and running...");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}