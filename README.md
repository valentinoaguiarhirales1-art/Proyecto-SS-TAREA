# SudoKlar — Sudoku Solver

Aplicación web interactiva para jugar, validar, generar y resolver sudokus de 9 × 9. Está hecha con JavaScript puro, HTML y CSS, sin frameworks ni dependencias de ejecución.

## Contenido del repositorio

- [`sudoku-solver-js/`](./sudoku-solver-js/): aplicación, estilos, favicon, algoritmo y pruebas.
- [`LICENSE`](./LICENSE): licencia MIT.

## Funcionalidades

- Edita las casillas del tablero con los dígitos del 1 al 9; usa `0` o borrar para vaciarlas. Las pistas originales están protegidas.
- Valida el tablero y resalta conflictos en filas, columnas y cuadros de 3 × 3.
- Resuelve sudokus válidos y avisa cuando hay conflictos o el tablero no tiene solución.
- Usa **Dar pista** para completar una casilla sin resolver el resto.
- Genera sudokus aleatorios tranquilos, intermedios o desafiantes; cada tablero generado tiene solución única.
- Incluye un ejemplo para practicar y un botón para limpiar el tablero.
- Guarda automáticamente el tablero, el cronómetro y el mejor tiempo por dificultad en el almacenamiento local del navegador.
- Se adapta a pantallas móviles y permite navegar por el tablero con las flechas del teclado.

## Ejecutar en local

Con Python 3, desde la raíz del repositorio:

```sh
python -m http.server 8000 --directory sudoku-solver-js
```

Abre `http://localhost:8000`. También puedes abrir la carpeta `sudoku-solver-js/` en Visual Studio Code y ejecutar `index.html` con Live Server. El servidor local es necesario para cargar correctamente los módulos de JavaScript.

## Ejecutar las pruebas

Las pruebas usan el ejecutor integrado de Node.js y no necesitan instalar dependencias. Se requiere Node.js 20 o posterior:

```sh
npm --prefix sudoku-solver-js test
```

## Algoritmo

El solver `solveSudoku(board)` valida las dimensiones, los valores y las reglas del tablero antes de aplicar backtracking. Para reducir intentos, elige primero la casilla con menos candidatos posibles y usa máscaras de bits para comprobar filas, columnas y cuadros. Devuelve una solución nueva sin modificar el tablero original, o `null` si no existe solución.

## GitHub Pages

La aplicación es estática. Como sus archivos están dentro de `sudoku-solver-js/`, para publicar este monorepo configura un flujo de GitHub Actions que despliegue esa carpeta como artefacto de Pages.

## Licencia

Distribuido bajo la licencia [MIT](./LICENSE).
