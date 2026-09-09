package com.gameshop.projection;

import java.math.BigDecimal;

public interface ProductDetail {
  Long getId();

  String getName();

  String getDescription();

  BigDecimal getPrice();

  Integer getStock();

  String getImageUrl();

  Boolean getActive();

  Long getCategoryId();

  String getCategoryName();
}
