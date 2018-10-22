package vlabs.rest;

import java.io.IOException;
import java.util.Properties;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

@SpringBootApplication
@ComponentScan
@EnableConfigurationProperties({ MongoProperties.class })
@EnableAutoConfiguration(exclude = {
        MongoAutoConfiguration.class,
        MongoDataAutoConfiguration.class,
})
public class VLabsRESTApplication {
    private static final Logger log = LoggerFactory.getLogger(VLabsRESTApplication.class);

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(VLabsRESTApplication.class);
        app.setWebApplicationType(WebApplicationType.REACTIVE);
        app.run(args);
//        Resource resource = new ClassPathResource("application.properties");
//        Properties properties = new Properties();
//        try {
//            properties.load(resource.getInputStream());
//            String projectTitle = properties.getProperty("project.title");
//
//            SpringApplication app = new SpringApplication(VLabsRESTApplication.class);
//            app.setWebApplicationType(WebApplicationType.REACTIVE);
//            app.run(args);
//            log.info(projectTitle + " is up and running...");
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
    }
}