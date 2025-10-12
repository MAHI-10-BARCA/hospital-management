package com.hms.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
    .requestMatchers("/", "/auth/**").permitAll() // Public endpoints for home & login/register
    .requestMatchers(HttpMethod.GET, "/doctors", "/doctors/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR")
    .requestMatchers(HttpMethod.POST, "/doctors").hasAuthority("ROLE_ADMIN")
    .requestMatchers(HttpMethod.PUT, "/doctors/**").hasAuthority("ROLE_ADMIN")
    .requestMatchers(HttpMethod.DELETE, "/doctors/**").hasAuthority("ROLE_ADMIN")

    .requestMatchers(HttpMethod.GET, "/patients", "/patients/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR")
    .requestMatchers(HttpMethod.POST, "/patients").hasAuthority("ROLE_ADMIN")
    .requestMatchers(HttpMethod.PUT, "/patients/**").hasAuthority("ROLE_ADMIN")
    .requestMatchers(HttpMethod.DELETE, "/patients/**").hasAuthority("ROLE_ADMIN")

    .requestMatchers(HttpMethod.GET, "/appointments", "/appointments/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR", "ROLE_PATIENT")
    .requestMatchers(HttpMethod.POST, "/appointments").hasAnyAuthority("ROLE_ADMIN", "ROLE_PATIENT")
    .requestMatchers(HttpMethod.PUT, "/appointments/**").hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR")
    .requestMatchers(HttpMethod.DELETE, "/appointments/**").hasAuthority("ROLE_ADMIN")

    .anyRequest().authenticated()
)

            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}