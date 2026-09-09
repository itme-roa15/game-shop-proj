package com.gameshop.dto.response;

public record ApiResponse<T>(boolean success, String message, T data) {
  public static <T> ApiResponse<T> ok(String message, T data) {
    return new ApiResponse<>(true, message, data);
  }

  public static <T> ApiResponse<T> fail(String message) {
    return new ApiResponse<>(false, message, null);
  }

  public static <T> ApiResponse<T> fail(String message, T data) {
    return new ApiResponse<>(false, message, data);
  }
}
