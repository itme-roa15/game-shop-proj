package com.gameshop.projection;

import com.gameshop.entity.OrderStatus;

public interface StatusCount {
  OrderStatus getStatus();

  Long getCount();
}
