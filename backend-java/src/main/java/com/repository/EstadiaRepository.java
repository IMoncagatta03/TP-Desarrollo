package com.repository;

import com.model.Estadia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface EstadiaRepository extends JpaRepository<Estadia, Integer> {

    @Query("SELECT e FROM Estadia e WHERE e.fechaDesde <= :fechaHasta AND e.fechaHasta >= :fechaDesde")
    List<Estadia> findEstadiasEnRango(@Param("fechaDesde") LocalDate fechaDesde,
            @Param("fechaHasta") LocalDate fechaHasta);
}
