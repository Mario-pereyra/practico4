---

type: business
status: draft
-------------

> Idioma del proyecto: **español**. Escribe este conocimiento en español. Mantén en inglés el código, los nombres de archivo, los comandos y las claves de configuración.

# Business

> Created by `kaddo bootstrap`. The minimal **why** of the project. Refine with the
> business-agent. As this matures it can split into problem.md, users.md, …

## Problem

La administración manual o desordenada de una cartelera de cine puede generar información inconsistente sobre películas, funciones, salas y disponibilidad de asientos.

Sin un sistema centralizado, los usuarios no tienen una forma clara de consultar qué películas están disponibles, en qué horarios se proyectan y qué asientos pueden reservar. Al mismo tiempo, el administrador necesita controlar películas, salas y funciones evitando errores críticos, como programar dos funciones superpuestas en la misma sala o permitir que un mismo asiento sea reservado dos veces para la misma función.

El problema principal no es vender entradas con pago real, sino demostrar una gestión confiable de cartelera, funciones y reservas dentro del alcance de un práctico universitario.

## Users

### Visitante

Quiere consultar la cartelera sin registrarse, buscar películas por nombre, filtrar por género y revisar el detalle de una película antes de decidir si desea reservar.

### Usuario autenticado

Quiere iniciar sesión, seleccionar una función, ver un mapa gráfico de asientos disponibles, elegir uno o varios asientos, confirmar una reserva y consultar sus reservas realizadas.

### Administrador

Quiere gestionar el catálogo de películas, crear salas con filas y columnas, programar funciones con fecha, hora y precio, y evitar conflictos de horarios o datos inconsistentes.

### Docente o evaluador

Quiere comprobar que el sistema cumple el enunciado del práctico, que las reglas de negocio están implementadas correctamente y que la solución puede ser explicada técnicamente.

## Value Proposition

Cine Reservas ofrece una aplicación web simple y defendible para consultar cartelera y reservar asientos, con un panel administrativo que permite gestionar películas, salas y funciones.

El valor del MVP está en demostrar un flujo completo y consistente:

1. El administrador crea películas, salas y funciones.
2. El visitante consulta la cartelera pública.
3. El usuario se registra o inicia sesión.
4. El usuario selecciona función y asientos.
5. El sistema confirma la reserva.
6. El sistema impide doble reserva del mismo asiento.
7. El sistema impide funciones superpuestas en una misma sala.

La propuesta prioriza integridad, claridad y alcance académico controlado.

## Business Rules

* La cartelera y el detalle de película son públicos.
* Solo usuarios autenticados pueden reservar asientos.
* Solo administradores pueden crear, editar o eliminar películas, salas y funciones.
* El registro público crea únicamente usuarios con rol `CLIENT`.
* El usuario `ADMIN` se crea mediante seed.
* Una función debe estar asociada a una película y a una sala existentes.
* Una sala no puede tener dos funciones con horarios superpuestos.
* Un asiento no puede reservarse dos veces para la misma función.
* Una reserva pertenece a un único usuario.
* Un usuario solo puede consultar sus propias reservas.
* Las reservas confirmadas son inmutables dentro del MVP.
* No existe cancelación de reservas en el MVP.
* No existen pagos, reembolsos, tickets QR ni notificaciones en el MVP.
* La capacidad de una sala se calcula como `rows × columns`.
* Los asientos de una sala se generan a partir de sus filas y columnas.
* El precio de una función se expresa en `BOB`.
* El backend es la autoridad para validar reglas críticas.

## Constraints

* El proyecto corresponde a un práctico universitario.
* El alcance debe mantenerse como MVP, sin funcionalidades comerciales avanzadas.
* La solución debe usar NestJS y React.
* La API debe seguir el contrato definido en `openapi.yaml`.
* El sistema debe usar autenticación JWT.
* El sistema debe diferenciar roles `CLIENT` y `ADMIN`.
* La persistencia debe proteger la integridad de reservas y funciones.
* La interfaz debe estar en español.
* El código, nombres de archivos, comandos y claves de configuración se mantienen en inglés.
* La implementación debe poder explicarse en una defensa académica.
* El sistema representa una única sede de cine.
* Los pósteres se almacenan localmente para la demo académica.

## Assumptions

* Existe una sola sede de cine.
* Existe al menos un administrador creado por seed.
* Los usuarios públicos solo pueden registrarse como `CLIENT`.
* El administrador usa la misma pantalla de login que los clientes.
* El reloj del servidor es la referencia para validar funciones futuras.
* Las funciones pasadas no se modifican para recalcular horarios históricos.
* El MVP no necesita integración con pagos ni servicios externos.
* El volumen de datos esperado es pequeño y adecuado para una demo.
* Las credenciales de demo serán documentadas en el `README.md`.
* La prioridad es cumplir el práctico, no construir una plataforma comercial completa.

## Open Questions

* No hay preguntas bloqueantes para comenzar la implementación del MVP.
* Decisiones futuras, fuera del MVP:

  * ¿Se permitirá cancelar reservas?
  * ¿Se agregará pago real?
  * ¿Se emitirán tickets o códigos QR?
  * ¿Se manejarán varias sedes?
  * ¿Se agregarán notificaciones por correo?
  * ¿Se permitirá recuperar contraseña?
  * ¿Se implementará refresh token?

## Quality checklist

* [x] The problem is stated without assuming the solution.
* [x] Users have goals, not just labels.
