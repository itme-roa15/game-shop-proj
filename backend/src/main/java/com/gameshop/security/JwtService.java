package com.gameshop.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final SecretKey key;
  private final long expirationMs;

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.expiration-ms}") long expirationMs) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationMs = expirationMs;
  }

  public String generate(UserDetails user) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(user.getUsername())
        .claim("roles", user.getAuthorities().stream().map(a -> a.getAuthority()).toList())
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plusMillis(expirationMs)))
        .signWith(key)
        .compact();
  }

  public String subject(String token) {
    return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload().getSubject();
  }

  public boolean valid(String token, UserDetails user) {
    try {
      return subject(token).equalsIgnoreCase(user.getUsername())
          && !Jwts.parser()
              .verifyWith(key)
              .build()
              .parseSignedClaims(token)
              .getPayload()
              .getExpiration()
              .before(new Date());
    } catch (JwtException | IllegalArgumentException ex) {
      return false;
    }
  }

  public long expirationMs() {
    return expirationMs;
  }
}
