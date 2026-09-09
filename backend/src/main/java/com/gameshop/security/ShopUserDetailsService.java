package com.gameshop.security;

import com.gameshop.entity.User;
import com.gameshop.repository.UserRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
public class ShopUserDetailsService implements UserDetailsService {
  private final UserRepository users;

  public ShopUserDetailsService(UserRepository users) {
    this.users = users;
  }

  @Override
  public UserDetails loadUserByUsername(String email) {
    User user =
        users
            .findByEmailIgnoreCase(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
        .password(user.getPasswordHash())
        .authorities(user.getRole().name())
        .build();
  }
}
