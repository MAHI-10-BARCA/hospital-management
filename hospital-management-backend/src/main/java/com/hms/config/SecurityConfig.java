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
                .requestMatchers("/", "/auth/**", "/api/auth/**").permitAll()

                // --- Profile endpoints ---
                .requestMatchers("/api/profile/**", "/api/doctor-profile/**", "/api/patient-profile/**").authenticated()

                // --- Doctor endpoints ---
                // ✅ FIXED: Changed from /api/doctors to /doctors (matches your controller)
                .requestMatchers(HttpMethod.GET, "/doctors", "/doctors/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR", "ROLE_PATIENT")
                .requestMatchers(HttpMethod.POST, "/doctors")
                    .hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/doctors/**")
                    .hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/doctors/**")
                    .hasAuthority("ROLE_ADMIN")

                // --- Patient endpoints ---
                // ✅ FIXED: Changed from /api/patients to /patients (matches your controller)
                .requestMatchers(HttpMethod.GET, "/patients", "/patients/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR")
                .requestMatchers(HttpMethod.POST, "/patients")
                    .hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/patients/**")
                    .hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/patients/**")
                    .hasAuthority("ROLE_ADMIN")

                // --- Schedule endpoints ---
                .requestMatchers(HttpMethod.GET, "/api/schedules/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR", "ROLE_PATIENT")
                .requestMatchers(HttpMethod.POST, "/api/schedules/doctor/**")
                    .hasAuthority("ROLE_DOCTOR") // Only doctors can create their own schedules
                .requestMatchers(HttpMethod.POST, "/api/schedules/admin")
                    .hasAuthority("ROLE_ADMIN") // Admin can create schedules for any doctor
                .requestMatchers(HttpMethod.PUT, "/api/schedules/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR")
                .requestMatchers(HttpMethod.DELETE, "/api/schedules/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR")

                // --- Appointment endpoints ---
                .requestMatchers(HttpMethod.GET, "/api/appointments", "/api/appointments/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR", "ROLE_PATIENT")
                .requestMatchers(HttpMethod.POST, "/api/appointments")
                    .hasAnyAuthority("ROLE_PATIENT", "ROLE_DOCTOR") // ADMIN NOT ALLOWED
                .requestMatchers(HttpMethod.PUT, "/api/appointments/**")
                    .hasAnyAuthority("ROLE_ADMIN", "ROLE_DOCTOR")
                .requestMatchers(HttpMethod.DELETE, "/api/appointments/**")
                    .hasAuthority("ROLE_ADMIN")

                // --- User Management (Admin only) ---
                .requestMatchers("/api/users/**")
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