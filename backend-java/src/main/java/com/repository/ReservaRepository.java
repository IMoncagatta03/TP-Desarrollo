package com.repository;

import com.model.Habitacion;
import com.model.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Integer> {

        @Query("SELECT r FROM Reserva r WHERE r.fechaDesde <= :fechaHasta AND r.fechaHasta >= :fechaDesde")
        List<Reserva> findReservasEnRango(@Param("fechaDesde") LocalDate fechaDesde,
                        @Param("fechaHasta") LocalDate fechaHasta);

        @Query("SELECT r FROM Reserva r WHERE r.habitacion = :habitacion AND " +
                        "((r.fechaDesde <= :fechaHasta) AND (r.fechaHasta >= :fechaDesde))")
        List<Reserva> findReservasDeHabitacionEnRango(@Param("habitacion") Habitacion habitacion,
                        @Param("fechaDesde") LocalDate fechaDesde,
                        @Param("fechaHasta") LocalDate fechaHasta);

        List<Reserva> findByApellidoStartingWithIgnoreCaseAndNombresStartingWithIgnoreCase(String apellido,
                        String nombres);

        List<Reserva> findByApellidoStartingWithIgnoreCase(String apellido);
}
