# Lector de rutas


## Instalación

Para instalar el proyecto es necesario el uso de node.js, una vez instalado, ejecutar los siguientes comandos, para instalar los paquetes necesarios del proyecto.

```
$ npm install
```


## Copilacion en carpeta de cordova www

Ejecutando el comando siguiente:

```
$ gulp build
o
$ gulp watch
```

## Estructura del proyecto

```
.
├── app           <-- Proyecto copilado para distribuir
│   ├── css
│   └── js
├── node_modules  <-- Paquetes para contruir y ejecutar el proyecto (no necesarios para la apliacion de distribución)
│   ├── *
└── src           <-- Codigo fuente
    ├── app         <-- Codigo JS Backbone
    └── libs      <-- Librerias (CSS)
    └── styles      <-- Estilos Stylus (CSS)
```





### Generar iconos
```
convert logo.png -resize '36x36'     -unsharp 1x4 "Icon-ldpi.png"
convert logo.png -resize '48x48'     -unsharp 1x4 "Icon-mdpi.png"
convert logo.png -resize '72x72'     -unsharp 1x4 "Icon-hdpi.png"
convert logo.png -resize '96x96'     -unsharp 1x4 "Icon-xhdpi.png"
convert logo.png -resize '144x144'   -unsharp 1x4 "Icon-xxhdpi.png"
convert logo.png -resize '192x192'   -unsharp 1x4 "Icon-xxxhdpi.png"
```
