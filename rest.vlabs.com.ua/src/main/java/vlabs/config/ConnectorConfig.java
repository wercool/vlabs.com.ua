package vlabs.config;

import org.apache.catalina.Context;
import org.apache.catalina.connector.Connector;
import org.apache.tomcat.util.descriptor.web.SecurityCollection;
import org.apache.tomcat.util.descriptor.web.SecurityConstraint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;

@Configuration
public class ConnectorConfig {


  @Value("${vlabs.redirector.http}")
  private int httpPort;

  @Value("${vlabs.redirector.https}")
  private int httpsPort;

  @Autowired
  private Environment environment;

  @Bean
  public TomcatServletWebServerFactory servletContainer() {
      TomcatServletWebServerFactory tomcat = new TomcatServletWebServerFactory() {
      @Override
      protected void postProcessContext(Context context) {
        SecurityConstraint securityConstraint = new SecurityConstraint();
        securityConstraint.setUserConstraint("CONFIDENTIAL");
        SecurityCollection collection = new SecurityCollection();
        collection.addPattern("/*");

        String[] activeProfiles = environment.getActiveProfiles();
        if (activeProfiles[0].equals("dev")) {
            collection.addMethod(DEFAULT_PROTOCOL);
        }

        securityConstraint.addCollection(collection);
        context.addConstraint(securityConstraint);
      }
    };

    tomcat.addAdditionalTomcatConnectors(redirectConnector());
    return tomcat;
  }

  private Connector redirectConnector() {
    Connector connector = new Connector("org.apache.coyote.http11.Http11NioProtocol");
    connector.setScheme("http");
    connector.setPort(httpPort);
    connector.setSecure(false);
    connector.setRedirectPort(httpsPort);

    return connector;
  }

}
