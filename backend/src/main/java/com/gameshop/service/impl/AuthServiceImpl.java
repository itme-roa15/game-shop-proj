package com.gameshop.service.impl;

import com.gameshop.dto.request.*;
import com.gameshop.dto.response.AuthResponse;
import com.gameshop.entity.*;
import com.gameshop.exception.*;
import com.gameshop.repository.UserRepository;
import com.gameshop.security.JwtService;
import com.gameshop.service.AuthService;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final AuthenticationManager auth;
  private final JwtService jwt;

  public AuthServiceImpl(
      UserRepository users, PasswordEncoder encoder, AuthenticationManager auth, JwtService jwt) {
    this.users = users;
    this.encoder = encoder;
    this.auth = auth;
    this.jwt = jwt;
  }

  @Override
  @Transactional
  public AuthResponse register(RegisterRequest r) {
    String email = r.email().trim().toLowerCase();
    if (users.existsByEmailIgnoreCase(email)) {
      throw new DuplicateEmailException();
    }
    User saved =
        users.save(new User(r.name().trim(), email, encoder.encode(r.password()), Role.ROLE_USER));
    return response(saved);
  }

  @Override
  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest r) {
    try {
      auth.authenticate(
          new UsernamePasswordAuthenticationToken(r.email().trim().toLowerCase(), r.password()));
    } catch (AuthenticationException ex) {
      throw new AuthException("Invalid email or password");
    }
    User user =
        users
            .findByEmailIgnoreCase(r.email())
            .orElseThrow(() -> new AuthException("Invalid email or password"));
    return response(user);
  }

  private AuthResponse response(User user) {
    UserDetails details =
        org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
            .password(user.getPasswordHash())
            .authorities(user.getRole().name())
            .build();
    return new AuthResponse(
        jwt.generate(details),
        "Bearer",
        jwt.expirationMs(),
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole().name());
  }
}
