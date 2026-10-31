# ✨ SudoKlar — *Sudoku Solver*

> **¡Un clásico, resuelto con lógica!** 🧩

Aplicación web interactiva para jugar, validar, generar y resolver sudokus de **9 × 9**, hecha con JavaScript puro, HTML y CSS. *Sin frameworks ni dependencias de ejecución.*

## 📂 Contenido del repositorio

- 📁 [`sudoku-solver-js/`](./sudoku-solver-js/) — *aplicación, estilos, favicon, algoritmo y pruebas.*
- 📄 [`LICENSE`](./LICENSE) — licencia **MIT**.

## ✨ Funcionalidades

- 🔢 Edita el tablero con dígitos del **1 al 9**; usa `0` o borrar para vaciar una casilla. *Las pistas originales están protegidas.*
- ✅ Valida las reglas y resalta conflictos en filas, columnas y cuadros de **3 × 3**.
- 🧠 Resuelve sudokus válidos y te avisa si hay conflictos o el tablero no tiene solución.
- 💡 Usa **Dar pista** para descubrir una casilla sin resolver el resto.
- 🎲 Genera sudokus *tranquilos, intermedios o desafiantes*, todos con solución única.
- 📋 Carga un ejemplo para practicar o limpia el tablero para empezar de nuevo.
- 💾 Guarda automáticamente tu tablero, cronómetro y mejor tiempo por dificultad en el navegador.
- 📱 Se adapta a pantallas móviles y permite recorrer el tablero con las flechas del teclado.

## 🚀 Ejecutar en local

Desde la raíz del repositorio, inicia un servidor local con Python:

```sh
python -m http.server 8000 --directory sudoku-solver-js
```

Abre <http://localhost:8000>. También puedes abrir `sudoku-solver-js/` en Visual Studio Code y ejecutar `index.html` con **Live Server**. *El servidor permite cargar correctamente los módulos de JavaScript.*

## 🧪 Ejecutar las pruebas

Las pruebas usan el ejecutor integrado de Node.js y no necesitan dependencias adicionales. Requieren **Node.js 20 o posterior**:

```sh
npm --prefix sudoku-solver-js test
```

## 🧩 ¿Cómo resuelve el Sudoku?

`solveSudoku(board)` valida el tablero y aplica **backtracking**. Para reducir intentos, prueba primero la casilla con menos candidatos y utiliza máscaras de bits para comprobar filas, columnas y cuadros. Devuelve una solución nueva —*sin modificar el tablero original*— o `null` si no encuentra ninguna.

## 🌐 Publicación en GitHub Pages

La aplicación es estática. Como vive en `sudoku-solver-js/`, configura GitHub Actions para publicar esa carpeta como artefacto de Pages.

## 📄 Licencia

Distribuido bajo la licencia [**MIT**](./LICENSE). ✨
