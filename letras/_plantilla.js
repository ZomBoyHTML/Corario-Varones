// PLANTILLA DE ALABANZA
// 1) Copia este archivo y cámbiale el nombre (ej. cancion-03.js).
// 2) Cambia numero, titulo y escribe la letra.
// 3) Añade su línea <script src="letras/cancion-03.js"></script> en index.html.
//
// CÓMO ESCRIBIR LA LETRA
// - Estrofa: escribe sus líneas seguidas, sin etiqueta.
// - Coro: pon una línea [Coro] y debajo las líneas del coro
//   (se ve centrado y en negrita, con la palabra CORO encima).
// - Deja una línea en blanco entre cada bloque.
// - Si hay otro bloque con nombre, usa [Puente], [Final], etc.

registrarCancion({
  numero: 3,                    // se muestra como 003
  titulo: "Nombre de la alabanza",
  autor: "",                    // opcional
  tono: "",                     // opcional
  letra: `
Primera línea de la primera estrofa
Segunda línea de la primera estrofa
Tercera línea de la primera estrofa
Cuarta línea de la primera estrofa

[Coro]
Primera línea del coro
Segunda línea del coro
Tercera línea del coro
Cuarta línea del coro
Quinta línea del coro

Primera línea de la segunda estrofa
Segunda línea de la segunda estrofa
Tercera línea de la segunda estrofa
Cuarta línea de la segunda estrofa
`
});
