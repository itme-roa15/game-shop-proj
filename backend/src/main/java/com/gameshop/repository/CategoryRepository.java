package com.gameshop.repository;

import com.gameshop.entity.Category;
import com.gameshop.projection.CategorySummary;
import java.util.List;
import org.springframework.data.jpa.repository.*;

public interface CategoryRepository extends JpaRepository<Category, Long> {
  @Query("select c.id as id,c.name as name from Category c order by c.name")
  List<CategorySummary> findAllSummaries();

  boolean existsByNameIgnoreCase(String name);
}
