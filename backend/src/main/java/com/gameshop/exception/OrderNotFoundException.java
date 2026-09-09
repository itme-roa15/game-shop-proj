package com.gameshop.exception;

import jakarta.persistence.EntityNotFoundException;

public class OrderNotFoundException extends EntityNotFoundException {
  public OrderNotFoundException(Long id) {
    super("Order " + id + " was not found");
  }
}
