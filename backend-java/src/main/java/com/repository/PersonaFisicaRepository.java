package com.repository;

import com.model.PersonaFisica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonaFisicaRepository extends JpaRepository<PersonaFisica, Integer> {
    java.util.Optional<PersonaFisica> findByCuit(String cuit);
}
