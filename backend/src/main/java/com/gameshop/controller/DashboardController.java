package com.gameshop.controller;

import com.gameshop.dto.response.*;
import com.gameshop.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {
  private final DashboardService service;

  public DashboardController(DashboardService service) {
    this.service = service;
  }

  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ApiResponse<DashboardResponse> stats() {
    return ApiResponse.ok("Dashboard statistics retrieved", service.stats());
  }
}
