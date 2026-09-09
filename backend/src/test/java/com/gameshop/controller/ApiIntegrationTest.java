package com.gameshop.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.fasterxml.jackson.databind.*;
import com.gameshop.entity.*;
import com.gameshop.repository.*;
import java.math.BigDecimal;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.*;

@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTest {
  private final MockMvc mvc;
  private final ObjectMapper json;
  private final UserRepository users;
  private final CategoryRepository categories;
  private final ProductRepository products;
  private final OrderRepository orders;
  private final PasswordEncoder encoder;

  @Autowired
  ApiIntegrationTest(
      MockMvc mvc,
      ObjectMapper json,
      UserRepository users,
      CategoryRepository categories,
      ProductRepository products,
      OrderRepository orders,
      PasswordEncoder encoder) {
    this.mvc = mvc;
    this.json = json;
    this.users = users;
    this.categories = categories;
    this.products = products;
    this.orders = orders;
    this.encoder = encoder;
  }

  @BeforeEach
  void clean() {
    orders.deleteAll();
    products.deleteAll();
    users.deleteAll();
    categories.deleteAll();
    categories.save(new Category("Controllers"));
  }

  @Test
  void publicCatalogIsAccessible() {
    try {
      mvc.perform(get("/api/categories"))
          .andExpect(status().isOk())
          .andExpect(jsonPath("$.success").value(true))
          .andExpect(jsonPath("$.data[0].name").value("Controllers"));
    } catch (Exception e) {
      throw new AssertionError(e);
    }
  }

  @Test
  void validationErrorsContainFieldMessages() throws Exception {
    mvc.perform(
            post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"x\",\"email\":\"bad\",\"password\":\"short\"}"))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.success").value(false))
        .andExpect(jsonPath("$.data.name").exists())
        .andExpect(jsonPath("$.data.email").exists())
        .andExpect(jsonPath("$.data.password").exists());
  }

  @Test
  void securityDistinguishesUnauthenticatedAndForbidden() throws Exception {
    mvc.perform(get("/api/admin/dashboard"))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.success").value(false));
    String token = registerAndToken("user@example.com");
    mvc.perform(get("/api/admin/dashboard").header("Authorization", "Bearer " + token))
        .andExpect(status().isForbidden())
        .andExpect(jsonPath("$.success").value(false));
  }

  @Test
  void failedOrderRollsBackEveryStockDeduction() throws Exception {
    String token = registerAndToken("buyer@example.com");
    Category category = categories.findAll().getFirst();
    Product available =
        products.save(new Product(category, "Gamepad", "", new BigDecimal("59.99"), 10, null));
    Product empty =
        products.save(new Product(category, "Console", "", new BigDecimal("499.99"), 0, null));
    String body =
        "{\"items\":[{\"productId\":"
            + available.getId()
            + ",\"quantity\":2},{\"productId\":"
            + empty.getId()
            + ",\"quantity\":1}]}";
    mvc.perform(
            post("/api/orders")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
        .andExpect(status().isBadRequest())
        .andExpect(
            jsonPath("$.message")
                .value(org.hamcrest.Matchers.containsString("Insufficient stock")));
    assertThat(products.findById(available.getId()).orElseThrow().getStock()).isEqualTo(10);
    assertThat(orders.count()).isZero();
  }

  @Test
  void successfulOrderDeductsStockAndAppearsInOwnHistory() throws Exception {
    String token = registerAndToken("shopper@example.com");
    Category category = categories.findAll().getFirst();
    Product product =
        products.save(new Product(category, "Headset", "", new BigDecimal("40.00"), 5, null));
    mvc.perform(
            post("/api/orders")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"items\":[{\"productId\":" + product.getId() + ",\"quantity\":2}]}"))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.data.total").value(80.00))
        .andExpect(jsonPath("$.data.status").value("PENDING"));
    assertThat(products.findById(product.getId()).orElseThrow().getStock()).isEqualTo(3);
    mvc.perform(get("/api/orders/me").header("Authorization", "Bearer " + token))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data[0].items[0].productName").value("Headset"));
  }

  @Test
  void adminCanManageAProductAndSoftDeleteHidesIt() throws Exception {
    users.save(
        new User("Admin", "admin@example.com", encoder.encode("password123"), Role.ROLE_ADMIN));
    String token = loginToken("admin@example.com");
    Long categoryId = categories.findAll().getFirst().getId();
    MvcResult created =
        mvc.perform(
                post("/api/products")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        "{\"categoryId\":"
                            + categoryId
                            + ",\"name\":\"Arcade Stick\",\"description\":\"Tournament"
                            + " controller\",\"price\":149.99,\"stock\":4,\"imageUrl\":\"https://example.com/stick.png\"}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.data.name").value("Arcade Stick"))
            .andReturn();
    Long id = json.readTree(created.getResponse().getContentAsString()).at("/data/id").asLong();
    mvc.perform(get("/api/products"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.data.totalElements").value(1));
    mvc.perform(delete("/api/products/{id}", id).header("Authorization", "Bearer " + token))
        .andExpect(status().isOk());
    mvc.perform(get("/api/products/{id}", id))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.success").value(false));
  }

  private String registerAndToken(String email) throws Exception {
    MvcResult result =
        mvc.perform(
                post("/api/auth/register")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(
                        "{\"name\":\"Test User\",\"email\":\""
                            + email
                            + "\",\"password\":\"password123\"}"))
            .andExpect(status().isCreated())
            .andReturn();
    return json.readTree(result.getResponse().getContentAsString()).at("/data/token").asText();
  }

  private String loginToken(String email) throws Exception {
    MvcResult result =
        mvc.perform(
                post("/api/auth/login")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"email\":\"" + email + "\",\"password\":\"password123\"}"))
            .andExpect(status().isOk())
            .andReturn();
    return json.readTree(result.getResponse().getContentAsString()).at("/data/token").asText();
  }
}
