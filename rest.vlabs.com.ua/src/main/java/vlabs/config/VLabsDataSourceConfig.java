package vlabs.config;

import java.util.Properties;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
@EnableJpaRepositories(
        entityManagerFactoryRef = "vlabsEMF", 
        basePackages = { "vlabs.repository" },
        transactionManagerRef = "vlabsTM")
public class VLabsDataSourceConfig {

    @Value("${vlabs.hibernate.dialect}")
    private String HIBERNATE_DIALECT;

    @Value("${vlabs.hibernate.naming-strategy}")
    private String HIBERNATE_NAMING_STRATEGY;

    @Value("${vlabs.hibernate.ddl-auto}")
    private String HIBERNATE_DDL_AUTO;

    @Value("${vlabs.hibernate.show_sql}")
    private String HIBERNATE_SHOW_SQL;

     // VLabs Data Source (primary)
    @Primary
    @Bean(name = "vlabsDS")
    @ConfigurationProperties(prefix="vlabs.datasource")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    // VLabs Entity Manager Factory (primary)
    @Primary
    @Bean(name = "vlabsEMF")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("vlabsDS") DataSource dataSource) {
        

        Properties jpaProperties = new Properties();
        jpaProperties.setProperty("hibernate.dialect", HIBERNATE_DIALECT);
        jpaProperties.setProperty("hibernate.naming-strategy", HIBERNATE_NAMING_STRATEGY);
        jpaProperties.setProperty("hibernate.ddl-auto", HIBERNATE_DDL_AUTO);
        jpaProperties.setProperty("hibernate.show_sql", HIBERNATE_SHOW_SQL);

        LocalContainerEntityManagerFactoryBean emf = builder
                                                     .dataSource(dataSource)
                                                     .packages("vlabs.model")
                                                     .persistenceUnit("vlabs")
                                                     .build();
        emf.setJpaProperties(jpaProperties);
        return emf;
    }


    // VLabs Transaction Manager (primary)
    @Primary
    @Bean(name = "vlabsTM")
    public PlatformTransactionManager transactionManager(
            @Qualifier("vlabsEMF") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
