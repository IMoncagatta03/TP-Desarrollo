package com.repository;

import com.model.ResponsableDePago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResponsableDePagoRepository extends JpaRepository<ResponsableDePago, Integer> {
   
}
