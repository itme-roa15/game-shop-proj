package com.gameshop.repository;

import com.gameshop.entity.*;
import com.gameshop.projection.*;
import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
  @Query(
      "select o.id as orderId,u.id as userId,u.name as userName,u.email as userEmail,o.status as"
          + " status,o.total as total,o.createdAt as createdAt,p.id as productId,p.name as"
          + " productName,i.quantity as quantity,i.unitPrice as unitPrice from Order o join o.user"
          + " u join o.items i join i.product p where u.id=:userId order by o.createdAt desc,o.id"
          + " desc,i.id")
  List<OrderRow> findRowsByUserId(@Param("userId") Long userId);

  @Query(
      "select o.id as orderId,u.id as userId,u.name as userName,u.email as userEmail,o.status as"
          + " status,o.total as total,o.createdAt as createdAt,p.id as productId,p.name as"
          + " productName,i.quantity as quantity,i.unitPrice as unitPrice from Order o join o.user"
          + " u join o.items i join i.product p order by o.createdAt desc,o.id desc,i.id")
  List<OrderRow> findAllRows();

  @Query(
      "select o.id as orderId,u.id as userId,u.name as userName,u.email as userEmail,o.status as"
          + " status,o.total as total,o.createdAt as createdAt,p.id as productId,p.name as"
          + " productName,i.quantity as quantity,i.unitPrice as unitPrice from Order o join o.user"
          + " u join o.items i join i.product p where o.id=:orderId order by i.id")
  List<OrderRow> findRowsByOrderId(@Param("orderId") Long orderId);

  @Query("select o.status as status,count(o) as count from Order o group by o.status")
  List<StatusCount> countGroupedByStatus();
}
