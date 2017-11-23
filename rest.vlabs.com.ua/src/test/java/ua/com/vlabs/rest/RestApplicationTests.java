package ua.com.vlabs.rest;

import static org.junit.Assert.*;

import java.sql.Connection;
import java.sql.SQLException;

import javax.sql.DataSource;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import vlabs.Application;

@RunWith(SpringJUnit4ClassRunner.class)
@SpringBootTest(classes = { Application.class })
public class RestApplicationTests
{
    private Logger log = LoggerFactory.getLogger(RestApplicationTests.class);

    @Autowired
    @Qualifier("vlabsDS")
    DataSource vlabsDS;
    @Autowired
    @Qualifier("valterikDS")
    DataSource valterikDS;

    @Test
    public void vlabsDSConnectionTest() throws SQLException
    {
        Connection connection = vlabsDS.getConnection();
        log.info("vlabsDS connection catalog: " + connection.getCatalog());
        assertEquals("vlabs", connection.getCatalog());
        connection.close();
    }

    @Test
    public void valterikDSConnectionTest() throws SQLException
    {
        Connection connection = valterikDS.getConnection();
        log.info("valterikDS connection catalog: " + connection.getCatalog());
        assertEquals("valterik", connection.getCatalog());
        connection.close();
    }
}
