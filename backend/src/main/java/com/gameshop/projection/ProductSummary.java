package com.gameshop.projection;

import java.math.BigDecimal;

public interface ProductSummary {
  Long getId();

  String getName();

  BigDecimal getPrice();

  Integer getStock();

  String getImageUrl();

  Long getCategoryId();

  String getCategoryName();
}
