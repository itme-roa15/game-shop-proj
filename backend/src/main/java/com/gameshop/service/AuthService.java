package com.gameshop.service;

import com.gameshop.dto.request.*;
import com.gameshop.dto.response.AuthResponse;

public interface AuthService {
  AuthResponse register(RegisterRequest request);

  AuthResponse login(LoginRequest request);
}
