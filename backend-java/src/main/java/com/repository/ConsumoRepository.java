package com.repository;

import com.model.Consumo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ConsumoRepository extends JpaRepository<Consumo, Integer> {
    List<Consumo> findByEstadiaId(Integer idEstadia);
}
