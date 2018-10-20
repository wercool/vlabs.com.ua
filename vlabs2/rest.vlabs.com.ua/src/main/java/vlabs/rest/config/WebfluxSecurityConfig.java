package vlabs.rest.config;

import java.util.function.Function;

import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UserDetailsRepositoryReactiveAuthenticationManager;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.MapReactiveUserDetailsService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;
import org.springframework.web.server.ServerWebExchange;

import reactor.core.publisher.Mono;
import vlabs.rest.auth.basic.BasicAuthenticationSuccessHandler;
import vlabs.rest.auth.bearer.BearerTokenReactiveAuthenticationManager;
import vlabs.rest.auth.bearer.ServerHttpBearerAuthenticationConverter;

@EnableWebFluxSecurity
public class WebfluxSecurityConfig{
    /**
     * A custom UserDetailsService to provide quick user rights for Spring Security,
     * more formal implementations may be added as separated files and annotated as
     * a Spring stereotype.
     *
     * @return MapReactiveUserDetailsService an InMemory implementation of user details
     */
    @Bean
    public MapReactiveUserDetailsService userDetailsService() {
        UserDetails user = User.withDefaultPasswordEncoder()
            .username("user")
            .password("user")
            .roles("USER")
            .build();
        return new MapReactiveUserDetailsService(user);
    }
    /**
     * For Spring Security webflux, a chain of filters will provide user authentication
     * and authorization, we add custom filters to enable JWT token approach.
     *
     * @param http An initial object to build common filter scenarios.
     *             Customized filters are added here.
     * @return SecurityWebFilterChain A filter chain for web exchanges that will
     * provide security
     **/
    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .authorizeExchange()
                    .pathMatchers("/login", "/")
                    .authenticated()
                .and()
                    .addFilterAt(basicAuthenticationFilter(), SecurityWebFiltersOrder.HTTP_BASIC)
                       .authorizeExchange()
                    .pathMatchers("/api/**")
                    .authenticated()
                .and()
                    .addFilterAt(bearerAuthenticationFilter(), SecurityWebFiltersOrder.AUTHENTICATION);

        return http.build();
    }
    /**
     * Use the already implemented logic in  AuthenticationWebFilter and set a custom
     * SuccessHandler that will return a JWT when a user is authenticated with user/password
     * Create an AuthenticationManager using the UserDetailsService defined above
     *
     * @return AuthenticationWebFilter
     */
    private AuthenticationWebFilter basicAuthenticationFilter(){
        UserDetailsRepositoryReactiveAuthenticationManager authManager;
        AuthenticationWebFilter basicAuthenticationFilter;
        ServerAuthenticationSuccessHandler successHandler;

        authManager = new UserDetailsRepositoryReactiveAuthenticationManager(userDetailsService());
        successHandler = new  BasicAuthenticationSuccessHandler();

        basicAuthenticationFilter = new AuthenticationWebFilter(authManager);
        basicAuthenticationFilter.setAuthenticationSuccessHandler(successHandler);

        return basicAuthenticationFilter;
    }
    /**
     * Use the already implemented logic by AuthenticationWebFilter and set a custom
     * converter that will handle requests containing a Bearer token inside
     * the HTTP Authorization header.
     * Set a dummy authentication manager to this filter, it's not needed because
     * the converter handles this.
     *
     * @return bearerAuthenticationFilter that will authorize requests containing a JWT
     */
    private AuthenticationWebFilter bearerAuthenticationFilter(){
        AuthenticationWebFilter bearerAuthenticationFilter;
        Function<ServerWebExchange, Mono<Authentication>> bearerConverter;
        ReactiveAuthenticationManager authManager;

        authManager  = new BearerTokenReactiveAuthenticationManager();
        bearerAuthenticationFilter = new AuthenticationWebFilter(authManager);
        bearerConverter = new ServerHttpBearerAuthenticationConverter();

        bearerAuthenticationFilter.setAuthenticationConverter(bearerConverter);
        bearerAuthenticationFilter.setRequiresAuthenticationMatcher(ServerWebExchangeMatchers.pathMatchers("/api/**"));

        return bearerAuthenticationFilter;
    }
}
