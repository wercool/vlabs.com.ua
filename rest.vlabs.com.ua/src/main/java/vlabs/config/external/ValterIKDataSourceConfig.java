package vlabs.config.external;

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
        entityManagerFactoryRef = "valterikEMF", 
        basePackages = { "external.valterik.repository" },
        transactionManagerRef = "valterikTM")
public class ValterIKDataSourceConfig {

    @Value("${valterik.hibernate.dialect}")
    private String HIBERNATE_DIALECT;

    @Value("${valterik.hibernate.naming-strategy}")
    private String HIBERNATE_NAMING_STRATEGY;

    @Value("${valterik.hibernate.ddl-auto}")
    private String HIBERNATE_DDL_AUTO;

    @Value("${valterik.hibernate.show_sql}")
    private String HIBERNATE_SHOW_SQL;

     // Valter IK Data Source
    @Bean(name = "valterikDS")
    @ConfigurationProperties(prefix="valterik.datasource")
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }

    // Valter IK Entity Manager Factory
    @Bean(name = "valterikEMF")
    public LocalContainerEntityManagerFactoryBean entityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("valterikDS") DataSource dataSource) {

        Properties jpaProperties = new Properties();
        jpaProperties.setProperty("hibernate.dialect", HIBERNATE_DIALECT);
        jpaProperties.setProperty("hibernate.naming-strategy", HIBERNATE_NAMING_STRATEGY);
        jpaProperties.setProperty("hibernate.ddl-auto", HIBERNATE_DDL_AUTO);
        jpaProperties.setProperty("hibernate.show_sql", HIBERNATE_SHOW_SQL);

        LocalContainerEntityManagerFactoryBean emf = builder
                                                     .dataSource(dataSource)
                                                     .packages("external.valterik.model")
                                                     .persistenceUnit("valterik")
                                                     .build();
        emf.setJpaProperties(jpaProperties);
        return emf;
    }


    // Valter IK Transaction Manager
    @Bean(name = "valterikTM")
    public PlatformTransactionManager transactionManager(
            @Qualifier("valterikEMF") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
