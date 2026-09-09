package com.gameshop.exception;

import jakarta.persistence.EntityNotFoundException;

public class ProductNotFoundException extends EntityNotFoundException {
  public ProductNotFoundException(Long id) {
    super("Product " + id + " was not found");
  }
}
