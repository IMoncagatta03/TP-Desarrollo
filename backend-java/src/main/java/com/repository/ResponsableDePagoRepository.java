package com.repository;

import com.model.ResponsableDePago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResponsableDePagoRepository extends JpaRepository<ResponsableDePago, Integer> {
    // Assuming implicit mapping or custom query if needed, but standard JPA might
    // fail if field is in subclass.
    // For now, simple ID search or we add finding by string if possible.
    // But wait, ResponsableDePago has no CUIT field directly? It's in subclasses
    // usually.
    // I will try to find by ID for now, or use a custom query if I knew the schema
    // better.
    // Let's create the file first.
}
