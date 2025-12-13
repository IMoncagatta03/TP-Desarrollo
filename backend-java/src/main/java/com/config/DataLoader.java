package com.config;

import com.model.*;
import com.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Date;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(
            PersonaJuridicaRepository personaJuridicaRepository,
            PersonaFisicaRepository personaFisicaRepository,
            HuespedRepository huespedRepository,
            DireccionRepository direccionRepository) {
        return args -> {
            try {
                // Load Persona Juridica (Cliente Prueba SRL)
                if (personaJuridicaRepository.findByCuit("12345678912").isEmpty()) {
                    System.out.println("Cargando datos de prueba: Cliente Prueba SRL");

                    PersonaJuridica pj = new PersonaJuridica();
                    pj.setTipoResponsable("JURIDICO");
                    pj.setCuit("12345678912");
                    pj.setRazonSocial("Cliente Prueba SRL");

                    // Direccion for PJ
                    Direccion dir = new Direccion();
                    dir.setPais("Argentina");
                    dir.setProvincia("Buenos Aires");
                    dir.setLocalidad("CABA");
                    dir.setDireccionCalle("Avenida Siempreviva");
                    dir.setDireccionNumero("742");
                    dir.setCodigoPostal("1000");

                    // Assuming Direccion needs to be saved first if Cascade is not set on PJ side
                    // correctly for non-owned
                    // But usually PersonaJuridica owns the relationship?
                    // PersonaJuridica.java has @OneToOne @JoinColumn(name = "id_direccion") -> it
                    // owns the FK.
                    // Direccion needs to be saved first or cascaded.
                    // DireccionRepository is needed if no cascade.
                    direccionRepository.save(dir);

                    pj.setDireccion(dir);
                    personaJuridicaRepository.save(pj);
                }

                // Load Persona Fisica (Responsable Mock)
                // Load Persona Fisica (Responsable Mock)
                String docMock = "11111111";
                String cuitMock = "20111111112";

                // Ensure Huesped exists
                Huesped h = huespedRepository.findById(docMock).orElse(null);
                if (h == null) {
                    System.out.println("Cargando datos de prueba: Huesped Juan Perez");
                    h = new Huesped();
                    h.setNumeroDocumento(docMock);
                    h.setTipoDocumento(com.enums.TipoDoc.DNI);
                    h.setApellido("Perez");
                    h.setNombres("Juan");
                    h.setFechaNacimiento(new Date());
                    h.setEmail("juan.perez@example.com");
                    h.setTelefono("1122334455");
                    h.setNacionalidad("Argentina");
                    h.setOcupacion("Empleado");
                    huespedRepository.save(h);
                }

                // Ensure PersonaFisica exists
                if (personaFisicaRepository.findByCuit(cuitMock).isEmpty()) {
                    System.out.println("Cargando datos de prueba: Persona Fisica Juan Perez");
                    PersonaFisica pf = new PersonaFisica();
                    pf.setTipoResponsable("FISICO");
                    pf.setHuesped(h);
                    pf.setCuit(cuitMock);
                    pf.setRazonSocial("Juan Perez");
                    personaFisicaRepository.save(pf);
                }
            } catch (Exception e) {
                System.err.println("Error cargando datos de prueba (DataLoader): " + e.getMessage());
                e.printStackTrace();
                // Do not re-throw, allow app to start
            }
        };
    }
}
