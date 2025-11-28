package com.arbeit.backend.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                         JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Public endpoints
                .requestMatchers("/").permitAll() // Root API info
                .requestMatchers("/api/").permitAll() // API info
                .requestMatchers("/health").permitAll() // Health check
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers("/auth/business/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/jobs").permitAll()
                .requestMatchers(HttpMethod.POST, "/jobs").permitAll() // For fetching specific job
                .requestMatchers(HttpMethod.POST, "/applications").permitAll()
                .requestMatchers("/mentorship/**").permitAll()
                .requestMatchers("/project/**").permitAll()
                .requestMatchers("/scanner/**").permitAll()

                // Business-only endpoints
                .requestMatchers("/business/**").hasRole("BUSINESS")

                // User-only endpoints (profiles, etc.)
                .requestMatchers(HttpMethod.GET, "/profile").hasAnyRole("USER", "BUSINESS")
                .requestMatchers(HttpMethod.PUT, "/profile").hasAnyRole("USER", "BUSINESS")

                // Admin endpoints (if needed in future)
                // .requestMatchers("/api/admin/**").hasRole("ADMIN")

                // All other requests need authentication
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Split allowed origins by comma and trim whitespace
        if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
            if (allowedOrigins.equals("*")) {
                // If wildcard is specified, allow all origins but disable credentials
                configuration.setAllowedOriginPatterns(Arrays.asList("*"));
                configuration.setAllowCredentials(false);
            } else {
                // Split by comma and allow specific origins
                String[] origins = allowedOrigins.split(",");
                configuration.setAllowedOriginPatterns(Arrays.stream(origins).map(String::trim).collect(Collectors.toList()));
                configuration.setAllowCredentials(true);
            }
        } else {
            // Default to localhost:3000
            configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:3000", "http://localhost:30080"));
            configuration.setAllowCredentials(true);
        }

        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}