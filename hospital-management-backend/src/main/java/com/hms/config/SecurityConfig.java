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
            // ✅ Enable CORS
            .cors(cors -> {})

            // ❌ Disable CSRF for APIs
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth
                // --- Public endpoints ---
                .requestMatchers("/", "/auth/**").permitAll()

                // --- Doctor endpoints ---
                .requestMatchers(HttpMethod.GET, "/doctors", "/doctors/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR")
                .requestMatchers(HttpMethod.POST, "/doctors")
                    .hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/doctors/**")
                    .hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/doctors/**")
                    .hasAuthority("ROLE_ADMIN")

                // --- Patient endpoints ---
                .requestMatchers(HttpMethod.GET, "/patients", "/patients/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR")
                .requestMatchers(HttpMethod.POST, "/patients")
                    .hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/patients/**")
                    .hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/patients/**")
                    .hasAuthority("ROLE_ADMIN")

                // --- Appointment endpoints ---
                .requestMatchers(HttpMethod.GET, "/appointments", "/appointments/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR", "ROLE_PATIENT", "ROLE_USER")
                .requestMatchers(HttpMethod.POST, "/appointments")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_PATIENT", "ROLE_USER")
                .requestMatchers(HttpMethod.PUT, "/appointments/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR")
                .requestMatchers(HttpMethod.DELETE, "/appointments/**")
                    .hasAuthority("ROLE_ADMIN")

                // --- Everything else ---
                .anyRequest().authenticated()
            )

            // ✅ Use stateless session (for JWT)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        // ✅ Add JWT filter before username-password filter
        http.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // --- Password encoder ---
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // --- Authentication Manager ---
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
