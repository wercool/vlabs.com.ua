package vlabs.rest;

import java.io.IOException;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import nu.pattern.OpenCV;

@SpringBootApplication
@ComponentScan
public class VLabsRESTApplication {

    private static final Logger log = LoggerFactory.getLogger(VLabsRESTApplication.class);

    public static void main(String[] args) {
        Resource resource = new ClassPathResource("application.properties");
        Properties properties = new Properties();
        try {
            properties.load(resource.getInputStream());
            String applicationTitle = properties.getProperty("application.title");

            OpenCV.loadShared();

            SpringApplication app = new SpringApplication(VLabsRESTApplication.class);
            app.setWebApplicationType(WebApplicationType.REACTIVE);
            app.run(args);

            log.info(applicationTitle + " is up and running...");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}