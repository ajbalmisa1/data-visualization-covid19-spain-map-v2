# data-visualization-covid19-spain-map
## Objetivo
Nuestro objetivo es visualizar un mapa de España teniendo la posibilidad de ver los afectados por COVID-19 en Marzo de 2020 y Abril de 2021 haciendo clic en dos botones. Consiguiendo asi ver la diferencia de los afectados desde el comienzo de la pandemia hasta un año despues.


## Prerequisitos

Empezaremos utilizando el ejemplo que ya viene en el sandbox de ```https://github.com/Lemoncode/d3js-typescript-examples/tree/master/02-maps/02-pin-location-scale```.

Luego necesitamos ejecutar en la terminal _npm install_ entre otros comandos para instalar todo lo necesario para tener nuestro mapa ejecutando.

```bash
npm install
```

Para tener proyecciones en nuestro mapa y acercar las Islas Canarias a la peninsula debemos instalar el modulo de _d3-composite-projections_ y poder incluirlo en un mapa topojson mediante con el segundo comando.

```bash
npm install d3-composite-projections --save
```
```bash
npm install @types/topojson-client --save-dev
```

Para poder leer los _require_ en _index.ts_ necesitamos lanzar el siguiente comando:
```bash
npm i --save-dev @types/node
```

## Steps

Lo primero que hemos tenido que realizar es la busqueda de los datos, para ello hemos acudido al repositiorio de datos del gobierno (datos.gob.es) con la ayuda de Francisco Florido, para buscar los afectados en la pandemia a nivel de comunidad autonoma. Se han guardado los datos en un archivo stats.ts junto con los datos que teniamos de afectado por COVID-19 en Marzo 2020 dentro de la carpeta src, quedando el siguiente resultado.

./stats.ts
```typescript
export const stats_current = [
  { name: "Andalucía", value: 6392 },
  { name: "Aragón", value: 2491 },
  { name: "Asturias", value: 1322 },
  { name: "Baleares", value: 1131 },
  { name: "Canarias", value: 1380 },
  { name: "Cantabria", value: 1213 },
  { name: "Castilla La Mancha", value: 7047 },
  { name: "Castilla y León", value: 6847 },
  { name: "Cataluña", value: 19991 },
  { name: "Ceuta", value: 51 },
  { name: "Valencia", value: 5922 },
  { name: "Extremadura", value: 1679 },
  { name: "Galicia", value: 4432 },
  { name: "Madrid", value: 29840 },
  { name: "Melilla", value: 62 },
  { name: "Murcia", value: 1041 },
  { name: "Navarra", value: 2497 },
  { name: "Pais Vasco", value: 6838 },
  { name: "La Rioja", value: 1960 },
];
```

Tambien hemos creado la interfaz _ResultEntry_ para ir asignar los datos dinamicamente segun al boton que hagamos clic.

```typescript
export interface ResultEntry {
  name: string;
  value: number;
}
```
Para añadir los botones debemos de incluir el siguiente codigo en _index.html_, dentro del grupo 'body'

```html
<button id="Previous">Resultados anteriores</button>
<button id="Actual">Resultados Actuales</button>
```

Ahora que tenemos los botones, vamos a gestionarlo en nuestro _index.ts_

- En primer lugar y con la ayuda de Sandra Real, debemos crear una función para retornar los afectados dado el nombre de una comunidad y el dataset de los valores, devolveremos el valor escalado. El resultado es el siguiente:

```typescript
  const calculateBasedOnAffectedCases = (comunidad: string, data: any[]) => {
    const entry = data.find((item) => item.name === comunidad);
    var max = data.reduce((max, item) => (item.value > max ? item.value : max), 0);
    return entry ? (entry.value / max) * 40 : 0;
  };
```
- Luego cambiaremos la función para calcular el radio basado en el número de afectados quedando asi:

```typescript
const calculateRadiusBasedOnAffectedCases = (
    comunidad: string,
    data: any[]
  ) => {
    return calculateBasedOnAffectedCases(comunidad, data);
  };
```
