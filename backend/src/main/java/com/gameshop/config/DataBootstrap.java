package com.gameshop.config;

import com.gameshop.entity.*;
import com.gameshop.repository.*;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataBootstrap implements CommandLineRunner {
  private static final List<String> DEFAULT_CATEGORIES =
      List.of("PlayStation", "Xbox", "Game Discs", "Controllers", "Accessories");
  private final CategoryRepository categories;
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final String email;
  private final String password;
  private final String name;

  public DataBootstrap(
      CategoryRepository categories,
      UserRepository users,
      PasswordEncoder encoder,
      @Value("${app.bootstrap.admin-email:}") String email,
      @Value("${app.bootstrap.admin-password:}") String password,
      @Value("${app.bootstrap.admin-name:Administrator}") String name) {
    this.categories = categories;
    this.users = users;
    this.encoder = encoder;
    this.email = email;
    this.password = password;
    this.name = name;
  }

  @Override
  @Transactional
  public void run(String... args) {
    if (categories.count() == 0) {
      DEFAULT_CATEGORIES.forEach(n -> categories.save(new Category(n)));
    }
    if (!email.isBlank() && !password.isBlank() && !users.existsByEmailIgnoreCase(email)) {
      users.save(
          new User(name, email.trim().toLowerCase(), encoder.encode(password), Role.ROLE_ADMIN));
    }
  }
}
