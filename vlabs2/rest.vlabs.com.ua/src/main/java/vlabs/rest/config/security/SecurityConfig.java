package vlabs.rest.config.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfig {

    private static final String[] AUTH_WHITELIST = {
            "/resources/**",
            "/api/auth/**",
            "/api/aux/**",
            "/favicon.ico"
    };

    @Autowired
    private UnauthorizedAuthenticationEntryPoint entryPoint;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    JWTAuthenticationWebFilter authenticationWebFilter;

    @Autowired
    private SecurityContextRepository securityContextRepository;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .exceptionHandling()
            .authenticationEntryPoint(entryPoint)
            .and()
            .addFilterAt(authenticationWebFilter, SecurityWebFiltersOrder.AUTHENTICATION)
//            .authenticationManager(authenticationManager)
//            .securityContextRepository(securityContextRepository)
            .authorizeExchange()
            .pathMatchers(HttpMethod.OPTIONS).permitAll()
            .pathMatchers(AUTH_WHITELIST).permitAll()
            .anyExchange().authenticated()
            .and()
            .httpBasic().disable()
            .formLogin().disable()
            .csrf().disable()
            .logout().disable();

        return http.build();
    }
}
