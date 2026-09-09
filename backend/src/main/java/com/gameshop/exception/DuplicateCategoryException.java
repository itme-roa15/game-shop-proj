package com.gameshop.exception;

public class DuplicateCategoryException extends RuntimeException {
  public DuplicateCategoryException() {
    super("A category with this name already exists");
  }
}
