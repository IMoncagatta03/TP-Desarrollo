package com.controller; // Define el paquete donde vive esta clase

// Importaciones: Traemos clases de otros paquetes para usarlas aquí
import com.dto.HabitacionEstadoDTO; // El DTO que vamos a devolver (la "bandeja" con datos)
import com.service.HabitacionService; // El Servicio que contiene la lógica (el "cocinero")
import org.springframework.beans.factory.annotation.Autowired; // Para la inyección de dependencias
import org.springframework.format.annotation.DateTimeFormat; // Para dar formato a las fechas que recibimos
import org.springframework.web.bind.annotation.*; // Importa todas las anotaciones web (@RestController, @GetMapping, etc.)

import java.time.LocalDate; // Clase de Java para manejar fechas (sin hora)
import java.util.List; // Clase de Java para manejar listas de objetos

@RestController // Le dice a Spring: "Esta clase es un Controlador REST, maneja peticiones web y
                // devuelve datos JSON"
@RequestMapping("/habitaciones") // Define la URL base: Todo lo de aquí empieza con "tusitio.com/habitaciones"
@CrossOrigin(origins = "*") // Permite que cualquiera (como tu Frontend en otro puerto) llame a esta API sin
                            // bloqueo de seguridad
public class HabitacionController { // Definición de la clase pública

    @Autowired // Inyección de Dependencias: Spring busca el HabitacionService creado y lo
               // conecta aquí automáticamente
    private HabitacionService habitacionService; // Declaramos la variable del servicio para usarla más abajo

    @GetMapping("/estado") // Define que este método responde a peticiones GET en la URL
                           // "/habitaciones/estado"
    public List<HabitacionEstadoDTO> obtenerEstadoHabitaciones( // El método devuelve una Lista de DTOs
            // @RequestParam: Lee los parámetros de la URL (ej: ?fechaDesde=2023-01-01)
            // @DateTimeFormat: Le dice a Spring que espere la fecha en formato ISO
            // (YYYY-MM-DD)
            @RequestParam("fechaDesde") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam("fechaHasta") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta) {

        // Llama al Servicio (el cerebro) pasándole las fechas recibidas y devuelve
        // directamente lo que el servicio responda
        return habitacionService.obtenerEstadoHabitaciones(fechaDesde, fechaHasta);
    }
}
