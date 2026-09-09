package com.gameshop.repository;

import com.gameshop.entity.Product;
import com.gameshop.projection.*;
import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {
  @Query(
      value =
          "select p.id as id,p.name as name,p.price as price,p.stock as stock,p.imageUrl as"
              + " imageUrl,c.id as categoryId,c.name as categoryName from Product p join p.category"
              + " c where p.active=true and (:categoryId is null or c.id=:categoryId) and"
              + " lower(p.name) like lower(concat('%',:keyword,'%')) and (:minPrice is"
              + " null or p.price>=:minPrice) and (:maxPrice is null or p.price<=:maxPrice)",
      countQuery =
          "select count(p) from Product p where p.active=true and (:categoryId is null or"
              + " p.category.id=:categoryId) and lower(p.name) like"
              + " lower(concat('%',:keyword,'%')) and (:minPrice is null or p.price>=:minPrice)"
              + " and (:maxPrice is null or p.price<=:maxPrice)")
  Page<ProductSummary> search(
      @Param("categoryId") Long categoryId,
      @Param("keyword") String keyword,
      @Param("minPrice") BigDecimal minPrice,
      @Param("maxPrice") BigDecimal maxPrice,
      Pageable pageable);

  @Query(
      "select p.id as id,p.name as name,p.description as description,p.price as price,p.stock as"
          + " stock,p.imageUrl as imageUrl,p.active as active,c.id as categoryId,c.name as"
          + " categoryName from Product p join p.category c where p.id=:id and p.active=true")
  Optional<ProductDetail> findActiveDetailById(@Param("id") Long id);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select p from Product p where p.id=:id")
  Optional<Product> findByIdForUpdate(@Param("id") Long id);

  long countByActiveTrue();
}
