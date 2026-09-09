package com.gameshop.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "products")
public class Product {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "category_id")
  private Category category;

  @Column(nullable = false, length = 200)
  private String name;

  @Column(columnDefinition = "TEXT")
  private String description;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal price;

  @Column(nullable = false)
  private int stock;

  @Column(name = "image_url", length = 500)
  private String imageUrl;

  @Column(nullable = false)
  private boolean active = true;

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected Product() {}

  public Product(
      Category category,
      String name,
      String description,
      BigDecimal price,
      int stock,
      String imageUrl) {
    update(category, name, description, price, stock, imageUrl);
  }

  public void update(
      Category category,
      String name,
      String description,
      BigDecimal price,
      int stock,
      String imageUrl) {
    this.category = category;
    this.name = name;
    this.description = description;
    this.price = price;
    this.stock = stock;
    this.imageUrl = imageUrl;
  }

  public void deactivate() {
    active = false;
  }

  public void deductStock(int quantity) {
    stock -= quantity;
  }

  public Long getId() {
    return id;
  }

  public Category getCategory() {
    return category;
  }

  public String getName() {
    return name;
  }

  public String getDescription() {
    return description;
  }

  public BigDecimal getPrice() {
    return price;
  }

  public int getStock() {
    return stock;
  }

  public String getImageUrl() {
    return imageUrl;
  }

  public boolean isActive() {
    return active;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
