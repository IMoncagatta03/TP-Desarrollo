package com.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.enums.TipoDoc;
import com.model.Direccion;
import com.model.Huesped;
import com.repository.HuespedRepository;

import java.util.List;

@Service
public class HuespedService {

    @Autowired
    private HuespedRepository huespedRepository;

    @Transactional
    public Huesped crearHuesped(Huesped huesped, boolean force) throws Exception {

        // Flujo Alternativo 2.B: Verificar si el documento ya existe
        boolean yaExiste = huespedRepository.existsByTipoDocumentoAndNumeroDocumento(
                huesped.getTipoDocumento(), huesped.getNumeroDocumento());

        if (yaExiste) {
            if (!force) {
                throw new Exception("¡CUIDADO! El tipo y número de documento ya existen en el sistema");
            } else {
                // Si force es true, actualizamos los datos del huésped existente
                Huesped huespedExistente = huespedRepository.findById(huesped.getNumeroDocumento()).orElse(null);

                if (huespedExistente != null) {
                    huespedExistente.setApellido(huesped.getApellido());
                    huespedExistente.setNombres(huesped.getNombres());
                    huespedExistente.setCuit(huesped.getCuit());
                    huespedExistente.setPosicionIva(huesped.getPosicionIva());
                    huespedExistente.setFechaNacimiento(huesped.getFechaNacimiento());
                    huespedExistente.setTelefono(huesped.getTelefono());
                    huespedExistente.setEmail(huesped.getEmail());
                    huespedExistente.setOcupacion(huesped.getOcupacion());
                    huespedExistente.setNacionalidad(huesped.getNacionalidad());

                    Direccion nuevaDireccion = huesped.getDireccion();
                    if (nuevaDireccion != null) {
                        Direccion direccionExistente = huespedExistente.getDireccion();
                        if (direccionExistente != null) {
                            direccionExistente.setDireccionCalle(nuevaDireccion.getDireccionCalle());
                            direccionExistente.setDireccionNumero(nuevaDireccion.getDireccionNumero());
                            direccionExistente.setDireccionPiso(nuevaDireccion.getDireccionPiso());
                            direccionExistente.setCodigoPostal(nuevaDireccion.getCodigoPostal());
                            direccionExistente.setLocalidad(nuevaDireccion.getLocalidad());
                            direccionExistente.setProvincia(nuevaDireccion.getProvincia());
                            direccionExistente.setPais(nuevaDireccion.getPais());
                        } else {
                            nuevaDireccion.setHuesped(huespedExistente);
                            huespedExistente.setDireccion(nuevaDireccion);
                        }
                    }
                    return huespedRepository.save(huespedExistente);
                }
            }
        }

        Direccion direccion = huesped.getDireccion();
        if (direccion != null) {
            direccion.setHuesped(huesped);
        }

        return huespedRepository.save(huesped);
    }

    public List<com.dto.HuespedDTO> obtenerTodos() {
        List<Huesped> huespedes = huespedRepository.findAll();
        return huespedes.stream()
                .map(h -> new com.dto.HuespedDTO(h.getNombres(), h.getApellido(),
                        h.getTipoDocumento(), h.getNumeroDocumento()))
                .collect(java.util.stream.Collectors.toList());
    }

    public List<com.dto.HuespedDTO> buscarHuespedes(String nombre, String apellido, TipoDoc tipoDocumento,
            String numeroDocumento) {
        if (nombre != null)
            nombre = nombre.toLowerCase() + "%";
        if (apellido != null)
            apellido = apellido.toLowerCase() + "%";
        if (numeroDocumento != null)
            numeroDocumento = numeroDocumento + "%";

        List<Huesped> huespedes = huespedRepository.buscarHuespedes(nombre, apellido, tipoDocumento, numeroDocumento);
        return huespedes.stream()
                .map(h -> new com.dto.HuespedDTO(h.getNombres(), h.getApellido(),
                        h.getTipoDocumento(),
                        h.getNumeroDocumento()))
                .collect(java.util.stream.Collectors.toList());
    }
}
