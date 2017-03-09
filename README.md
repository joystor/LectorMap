# LectorMap

Apliacion en cordova, que muestra en un mapa de google, las rutas a visitar en el dia, conectandose a un API,


### Copilar codigo html5 y enviar a la carpeta www de la aplicacion
La aplicacion JS usa: backbone, underscore
```
$ cd AppH5
$ npm install
$ gulp build
```

### Instalacion y configuracion cordova
Tener previamente instalado el SDK de Android y sus variables de entorno
```
npm install cordova -g
$ cd LectorMap
$ cordova platform add android
$ cordova prepare

```

Generar App

Copiar las carpetas que se encuentran en: LectorMap/res/
en: LectorMap/platforms/android/res/ para que se generen con los iconos de la aplicacion
```
$ cordova build
```
