package com.gameshop.exception;

public class DuplicateEmailException extends AuthException {
  public DuplicateEmailException() {
    super("An account with this email already exists");
  }
}
