package com.gameshop.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private OrderStatus status = OrderStatus.PENDING;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal total = BigDecimal.ZERO;

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<OrderItem> items = new ArrayList<>();

  protected Order() {}

  public Order(User user) {
    this.user = user;
  }

  public void addItem(Product product, int quantity, BigDecimal unitPrice) {
    items.add(new OrderItem(this, product, quantity, unitPrice));
    total = total.add(unitPrice.multiply(BigDecimal.valueOf(quantity)));
  }

  public void setStatus(OrderStatus status) {
    this.status = status;
  }

  public Long getId() {
    return id;
  }

  public User getUser() {
    return user;
  }

  public OrderStatus getStatus() {
    return status;
  }

  public BigDecimal getTotal() {
    return total;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public List<OrderItem> getItems() {
    return List.copyOf(items);
  }
}
