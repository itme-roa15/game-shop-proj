package com.gameshop.service.impl;

import com.gameshop.dto.request.CategoryRequest;
import com.gameshop.dto.response.CategoryResponse;
import com.gameshop.entity.Category;
import com.gameshop.exception.*;
import com.gameshop.repository.CategoryRepository;
import com.gameshop.service.CategoryService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryServiceImpl implements CategoryService {
  private final CategoryRepository categories;

  public CategoryServiceImpl(CategoryRepository categories) {
    this.categories = categories;
  }

  @Override
  @Transactional(readOnly = true)
  public List<CategoryResponse> findAll() {
    return categories.findAllSummaries().stream()
        .map(c -> new CategoryResponse(c.getId(), c.getName()))
        .toList();
  }

  @Override
  @Transactional
  public CategoryResponse create(CategoryRequest r) {
    String name = r.name().trim();
    if (categories.existsByNameIgnoreCase(name)) {
      throw new DuplicateCategoryException();
    }
    Category c = categories.save(new Category(name));
    return new CategoryResponse(c.getId(), c.getName());
  }

  @Override
  @Transactional
  public CategoryResponse rename(Long id, CategoryRequest r) {
    Category c = categories.findById(id).orElseThrow(() -> new CategoryNotFoundException(id));
    String name = r.name().trim();
    if (!c.getName().equalsIgnoreCase(name) && categories.existsByNameIgnoreCase(name)) {
      throw new DuplicateCategoryException();
    }
    c.setName(name);
    return new CategoryResponse(c.getId(), c.getName());
  }
}
