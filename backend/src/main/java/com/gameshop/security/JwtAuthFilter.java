package com.gameshop.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtService jwt;
  private final UserDetailsService users;

  public JwtAuthFilter(JwtService jwt, UserDetailsService users) {
    this.jwt = jwt;
    this.users = users;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    String header = req.getHeader("Authorization");
    if (header != null
        && header.startsWith("Bearer ")
        && SecurityContextHolder.getContext().getAuthentication() == null) {
      String token = header.substring(7);
      try {
        String email = jwt.subject(token);
        UserDetails details = users.loadUserByUsername(email);
        if (jwt.valid(token, details)) {
          UsernamePasswordAuthenticationToken auth =
              new UsernamePasswordAuthenticationToken(details, null, details.getAuthorities());
          auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
          SecurityContextHolder.getContext().setAuthentication(auth);
        }
      } catch (Exception ignored) {
        SecurityContextHolder.clearContext();
      }
    }
    chain.doFilter(req, res);
  }
}
