package com.gameshop.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gameshop.dto.response.ApiResponse;
import com.gameshop.security.JwtAuthFilter;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration c) throws Exception {
    return c.getAuthenticationManager();
  }

  @Bean
  CorsConfigurationSource cors(@Value("${app.cors.allowed-origin}") String origin) {
    CorsConfiguration c = new CorsConfiguration();
    c.setAllowedOrigins(List.of(origin));
    c.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    c.setAllowedHeaders(List.of("Authorization", "Content-Type"));
    c.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", c);
    return source;
  }

  @Bean
  SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter filter, ObjectMapper mapper)
      throws Exception {
    return http.csrf(csrf -> csrf.disable())
        .cors(cors -> {})
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(
            a ->
                a.requestMatchers(HttpMethod.POST, "/api/auth/**")
                    .permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/categories/**", "/api/products/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .exceptionHandling(
            e ->
                e.authenticationEntryPoint(
                        (req, res, ex) ->
                            write(
                                mapper, res, HttpStatus.UNAUTHORIZED, "Authentication is required"))
                    .accessDeniedHandler(
                        (req, res, ex) ->
                            write(mapper, res, HttpStatus.FORBIDDEN, "Access denied")))
        .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }

  private static void write(
      ObjectMapper mapper,
      jakarta.servlet.http.HttpServletResponse res,
      HttpStatus status,
      String message)
      throws java.io.IOException {
    res.setStatus(status.value());
    res.setContentType(MediaType.APPLICATION_JSON_VALUE);
    mapper.writeValue(res.getOutputStream(), ApiResponse.fail(message));
  }
}
