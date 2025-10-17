package com.hms.config;

import java.util.Arrays;

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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            // ✅ Enable CORS with custom configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ❌ Disable CSRF for APIs
            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth
                // --- Public endpoints ---
                .requestMatchers("/", "/auth/**").permitAll()

                // --- Profile endpoints ---
                .requestMatchers("/api/profile/**").authenticated()

                // --- Doctor endpoints ---
                .requestMatchers(HttpMethod.GET, "/api/doctors", "/api/doctors/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR")
                .requestMatchers(HttpMethod.POST, "/api/doctors")
                    .hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/doctors/**")
                    .hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/doctors/**")
                    .hasAuthority("ROLE_ADMIN")

                // --- Patient endpoints ---
                .requestMatchers(HttpMethod.GET, "/api/patients", "/api/patients/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR")
                .requestMatchers(HttpMethod.POST, "/api/patients")
                    .hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/patients/**")
                    .hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/patients/**")
                    .hasAuthority("ROLE_ADMIN")

                // --- Appointment endpoints ---
                .requestMatchers(HttpMethod.GET, "/api/appointments", "/api/appointments/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR", "ROLE_PATIENT", "ROLE_USER")
                .requestMatchers(HttpMethod.POST, "/api/appointments")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_PATIENT", "ROLE_USER")
                .requestMatchers(HttpMethod.PUT, "/api/appointments/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR")
                .requestMatchers(HttpMethod.DELETE, "/api/appointments/**")
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

    // CORS Configuration Bean
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*")); // Use patterns to avoid CORS error
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
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