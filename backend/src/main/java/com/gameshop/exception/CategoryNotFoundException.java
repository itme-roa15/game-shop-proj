package com.gameshop.exception;

import jakarta.persistence.EntityNotFoundException;

public class CategoryNotFoundException extends EntityNotFoundException {
  public CategoryNotFoundException(Long id) {
    super("Category " + id + " was not found");
  }
}
