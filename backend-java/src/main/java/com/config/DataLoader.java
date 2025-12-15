package com.config;

import com.enums.TipoDoc;
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

                if (personaJuridicaRepository.findByCuit("12345678912").isEmpty()) {
                    System.out.println("Cargando datos de prueba: Cliente Prueba SRL");

                    PersonaJuridica pj = new PersonaJuridica();
                    pj.setTipoResponsable("JURIDICO");
                    pj.setCuit("12345678912");
                    pj.setRazonSocial("Cliente Prueba SRL");

                    Direccion dir = new Direccion();
                    dir.setPais("Argentina");
                    dir.setProvincia("Buenos Aires");
                    dir.setLocalidad("CABA");
                    dir.setDireccionCalle("Avenida Siempreviva");
                    dir.setDireccionNumero("742");
                    dir.setCodigoPostal("1000");

                    pj.setDireccion(dir);
                    personaJuridicaRepository.save(pj);
                }

            } catch (Exception e) {
                System.err.println("Error cargando datos de prueba (DataLoader): " + e.getMessage());
                e.printStackTrace();

            }
        };
    }
}
