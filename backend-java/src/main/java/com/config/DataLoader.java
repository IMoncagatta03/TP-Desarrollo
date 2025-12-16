package com.config;

import com.enums.EstadoEstadia;
import com.enums.PosIva;
import com.enums.TipoDoc;
import com.model.*;
import com.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(
            PersonaJuridicaRepository personaJuridicaRepository,
            PersonaFisicaRepository personaFisicaRepository,
            HuespedRepository huespedRepository,
            DireccionRepository direccionRepository,
            HabitacionRepository habitacionRepository,
            ReservaRepository reservaRepository,
            EstadiaRepository estadiaRepository) {
        return args -> {
            try {
                System.out.println("Iniciando carga de datos de prueba...");

                // --- 1. HUESPEDES ---
                System.out.println("Verificando Huespedes...");

                // Huesped 1: Juan Perez (Local)
                if (!huespedRepository.existsById("11111111")) {
                    Huesped h1 = new Huesped();
                    h1.setNumeroDocumento("11111111");
                    h1.setTipoDocumento(TipoDoc.DNI);
                    h1.setNombres("Juan");
                    h1.setApellido("Perez");
                    h1.setEmail("juan.perez@example.com");
                    h1.setFechaNacimiento(
                            Date.from(LocalDate.of(1990, 1, 1).atStartOfDay(ZoneId.systemDefault()).toInstant()));
                    h1.setPosicionIva(PosIva.CONSUMIDOR_FINAL);
                    h1.setOcupacion("Empleado");
                    h1.setNacionalidad("Argentina");
                    h1.setTelefono("1112345678");

                    Direccion d1 = new Direccion();
                    d1.setPais("Argentina");
                    d1.setProvincia("Buenos Aires");
                    d1.setLocalidad("Mar del Plata");
                    d1.setDireccionCalle("San Martin");
                    d1.setDireccionNumero("123");
                    d1.setCodigoPostal("7600");
                    d1.setHuesped(h1);
                    h1.setDireccion(d1);

                    huespedRepository.save(h1);
                    System.out.println("Creado Huesped: Juan Perez");
                }

                // Huesped 2: Maria Gonzalez (Local)
                if (!huespedRepository.existsById("22222222")) {
                    Huesped h2 = new Huesped();
                    h2.setNumeroDocumento("22222222");
                    h2.setTipoDocumento(TipoDoc.DNI);
                    h2.setNombres("Maria");
                    h2.setApellido("Gonzalez");
                    h2.setEmail("maria.gonzalez@example.com");
                    h2.setFechaNacimiento(
                            Date.from(LocalDate.of(1995, 5, 15).atStartOfDay(ZoneId.systemDefault()).toInstant()));
                    h2.setPosicionIva(PosIva.MONOTRIBUTISTA);
                    h2.setOcupacion("Arquitecta");
                    h2.setNacionalidad("Argentina");
                    h2.setTelefono("1187654321");

                    Direccion d2 = new Direccion();
                    d2.setPais("Argentina");
                    d2.setProvincia("CABA");
                    d2.setLocalidad("Palermo");
                    d2.setDireccionCalle("Santa Fe");
                    d2.setDireccionNumero("4500");
                    d2.setCodigoPostal("1425");
                    d2.setHuesped(h2);
                    h2.setDireccion(d2);

                    huespedRepository.save(h2);
                    System.out.println("Creado Huesped: Maria Gonzalez");
                }

                // Huesped 3: John Doe (Extranjero)
                if (!huespedRepository.existsById("A1234567")) {
                    Huesped h3 = new Huesped();
                    h3.setNumeroDocumento("A1234567");
                    h3.setTipoDocumento(TipoDoc.PASAPORTE);
                    h3.setNombres("John");
                    h3.setApellido("Doe");
                    h3.setEmail("john.doe@example.com");
                    h3.setFechaNacimiento(
                            Date.from(LocalDate.of(1985, 11, 25).atStartOfDay(ZoneId.systemDefault()).toInstant()));
                    h3.setPosicionIva(PosIva.CONSUMIDOR_FINAL);
                    h3.setOcupacion("Turista");
                    h3.setNacionalidad("USA");
                    h3.setTelefono("15551234");

                    Direccion d3 = new Direccion();
                    d3.setPais("USA");
                    d3.setProvincia("NY");
                    d3.setLocalidad("New York");
                    d3.setDireccionCalle("5th Avenue");
                    d3.setDireccionNumero("10");
                    d3.setCodigoPostal("10001");
                    d3.setHuesped(h3);
                    h3.setDireccion(d3);

                    huespedRepository.save(h3);
                    System.out.println("Creado Huesped: John Doe");
                }

                // --- 2. RESPONSABLES DE PAGO (Personas Fisicas) ---
                // Chequeamos si la persona fisica para Juan Perez ya existe
                // Como no hay acceso directo facil, verificamos si existe huesped "11111111" y
                // si podemos buscar responsable
                // Simplificacion: Asumimos que si no existe el responsable con id 1? No, ids
                // son generados.
                // Mejor: "Si el huesped Juan Perez existe, aseguramos que tenga responsable
                // fisico".
                // Pero ResponsableDePago es una tabla separada vinculada.
                // Para no duplicar, chequeamos si existe PersonaFisica vinculada a ese huesped.
                // Como PersonaFisica tiene UNIQUE constraint con Huesped?
                // En el modelo PersonaFisica: @JoinColumn(..., unique = true) private Huesped
                // huesped;
                // Entonces si ya existe, fallaria al insertar.
                // Pero mejor prevenir.

                System.out.println("Verificando Responsables de Pago...");

                Optional<Huesped> h1Opt = huespedRepository.findById("11111111");
                if (h1Opt.isPresent()) {
                    // Buscamos si ya existe una persona fisica para este huesped.
                    // No tenemos repositorio directo `findByHuesped`.
                    // Usamos un try-catch o count global si es seguro, pero aqui count global no
                    // sirve.
                    // Dado que es un script de prueba, podemos asumir: Si creamos al huesped
                    // recien, creamos el responsable.
                    // Si ya existia, quizas ya lo tenga.
                    // Para ser robustos sin complicar queries:
                    // Intentamos buscar si existe responsable fisico en general? No.

                    // Estrategia: Solo crear si Huesped fue creado recien? No tenemos estado.
                    // Estrategia: Count de PersonaFisica. Si es bajo, asumimos que falta.
                    // O mejor:
                    // Verificamos si existe en la base (huespedRepository.existsById) antes de
                    // todo, si existia, asumimos que tiene.
                    // Si no existia, y lo creamos, creamos el responsable.
                    // Pero el codigo arriba corre siempre.

                    // Solucion practica: Check count de PersonaFisica. Si es 0, creamos. Si > 0,
                    // asumimos data ok.
                    // El usuario dijo "veo a Juan Perez".
                    if (personaFisicaRepository.count() == 0) {
                        PersonaFisica pf1 = new PersonaFisica();
                        pf1.setTipoResponsable("FISICO");
                        pf1.setHuesped(h1Opt.get());
                        personaFisicaRepository.save(pf1);
                        System.out.println("Asignado Responsable Fisico a Juan Perez");
                    }
                }

                // --- 3. RESPONSABLES DE PAGO (Personas Juridicas) ---
                if (personaJuridicaRepository.findByCuit("12345678912").isEmpty()) {
                    System.out.println("Cargando Cliente Prueba SRL (Juridico)...");
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

                // --- 4. RESERVAS ---
                System.out.println("Verificando Reservas...");
                // Reserva 1: Pasada (Finalizada) - Juan Perez
                if (reservaRepository.findByApellidoStartingWithIgnoreCase("Perez").isEmpty()) {
                    Habitacion hab101 = habitacionRepository.findById("101").orElse(null);
                    if (hab101 != null) {
                        Reserva r1 = new Reserva();
                        r1.setHabitacion(hab101);
                        r1.setFechaDesde(LocalDate.now().minusDays(10));
                        r1.setFechaHasta(LocalDate.now().minusDays(5));
                        r1.setNombres("Juan");
                        r1.setApellido("Perez");
                        r1.setTelefono("1112345678");
                        reservaRepository.save(r1);
                        System.out.println("Creada Reserva Pasada para Juan Perez");
                    }
                }

                // Reserva 2: Actual (Check-in hoy/ayer) - Maria Gonzalez
                if (reservaRepository.findByApellidoStartingWithIgnoreCase("Gonzalez").isEmpty()) {
                    Habitacion hab102 = habitacionRepository.findById("102").orElse(null);
                    if (hab102 != null) {
                        Reserva r2 = new Reserva();
                        r2.setHabitacion(hab102);
                        r2.setFechaDesde(LocalDate.now().minusDays(1));
                        r2.setFechaHasta(LocalDate.now().plusDays(4));
                        r2.setNombres("Maria");
                        r2.setApellido("Gonzalez");
                        r2.setTelefono("1187654321");
                        reservaRepository.save(r2);
                        System.out.println("Creada Reserva Actual para Maria Gonzalez");
                    }
                }

                // Reserva 3: Futura - John Doe
                if (reservaRepository.findByApellidoStartingWithIgnoreCase("Doe").isEmpty()) {
                    Habitacion hab201 = habitacionRepository.findById("201").orElse(null);
                    if (hab201 != null) {
                        Reserva r3 = new Reserva();
                        r3.setHabitacion(hab201);
                        r3.setFechaDesde(LocalDate.now().plusDays(10));
                        r3.setFechaHasta(LocalDate.now().plusDays(15));
                        r3.setNombres("John");
                        r3.setApellido("Doe");
                        r3.setTelefono("15551234");
                        reservaRepository.save(r3);
                        System.out.println("Creada Reserva Futura para John Doe");
                    }
                }

                // --- 5. ESTADIAS ---
                if (estadiaRepository.count() == 0) {
                    System.out.println("Verificando Estadias...");

                    // Estadia para la Reserva 2 (Actual) - Huesped Maria Gonzalez
                    List<Reserva> reservasMaria = reservaRepository.findByApellidoStartingWithIgnoreCase("Gonzalez");
                    Huesped maria = huespedRepository.findById("22222222").orElse(null);

                    if (!reservasMaria.isEmpty() && maria != null) {
                        Reserva reservaMaria = reservasMaria.get(0);
                        // Verificar que no tenga estadia ya
                        // Como? asumimos que si count es 0, no tiene.
                        // Pero si count > 0 (otras estadias), igual podria faltar esta.
                        // Correcto seria buscar `estadiaRepository.findByReserva(reservaMaria)` pero no
                        // tenemos ese metodo a mano (quizas).
                        // Asumimos que si estamos en este bloque y Maria tiene reserva, le creamos la
                        // estadia si no hay estadias globales?
                        // No, mejor check simple:
                        // Si creamos la reserva recien, seguro falta la estadia. Pero aqui estamos
                        // desacoplados.

                        // Simplificacion: Creamos solo si no hay ninguna estadia en el sistema, o nos
                        // arriesgamos a duplicar (romperia unique constraint id_reserva).
                        // Dado que id_reserva es unique en Estadia, si falla el save, no pasa nada (try
                        // catch global).

                        try {
                            Estadia e1 = new Estadia();
                            e1.setReserva(reservaMaria);
                            e1.setHuesped(maria);
                            e1.setHabitacion(reservaMaria.getHabitacion());
                            e1.setFechaDesde(reservaMaria.getFechaDesde());
                            e1.setFechaHasta(reservaMaria.getFechaHasta());
                            e1.setEstado(EstadoEstadia.VIGENTE);

                            estadiaRepository.save(e1);
                            System.out.println("Creada Estadia Vigente para Maria Gonzalez");
                        } catch (Exception ex) {
                            System.out.println("Estadia para Maria ya existia o error: " + ex.getMessage());
                        }
                    }
                }

                System.out.println("Carga de datos de prueba finalizada exitosamente.");

            } catch (Exception e) {
                System.err.println("Error cargando datos de prueba (DataLoader): " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
}
