package com.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.model.Huesped;
import com.model.TipoDoc;

@Repository
public interface HuespedRepository extends JpaRepository<Huesped, Long> {
     
    boolean existsByTipoDocumentoAndNumeroDocumento(TipoDoc tipoDocumento, String numeroDocumento);
}