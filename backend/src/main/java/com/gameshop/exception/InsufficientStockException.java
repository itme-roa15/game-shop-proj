package com.gameshop.exception;

public class InsufficientStockException extends RuntimeException {
  public InsufficientStockException(String name, int available, int requested) {
    super(
        "Insufficient stock for " + name + ": requested " + requested + ", available " + available);
  }
}
