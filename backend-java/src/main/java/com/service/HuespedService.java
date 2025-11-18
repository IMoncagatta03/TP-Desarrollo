package com.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.model.Direccion;
import com.model.Huesped;
import com.repository.HuespedRepository;

@Service
public class HuespedService {

    @Autowired
    private HuespedRepository huespedRepository;

    @Transactional 
    public Huesped crearHuesped(Huesped huesped, boolean force) throws Exception {
        
        // Flujo Alternativo 2.B: Verificar si el documento ya existe
        boolean yaExiste = huespedRepository.existsByTipoDocumentoAndNumeroDocumento(
                huesped.getTipoDocumento(), huesped.getNumeroDocumento());

        if (yaExiste && !force) {
            throw new Exception("¡CUIDADO! El tipo y número de documento ya existen en el sistema");
        }
        
        
        Direccion direccion = huesped.getDireccion();
        if (direccion != null) {
           
            direccion.setHuesped(huesped);
        }

        return huespedRepository.save(huesped);
    }
}