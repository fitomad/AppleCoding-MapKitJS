# AppleCoding-MapKitJS

Sitio web que acompaña al artículo de Apple Coding sobre MapKit JS

![Webshot](https://github.com/fitomad/AppleCoding-MapKitJS/blob/master/Webshots/portada.png)

## Configuración

Antes de arrancar el website es necesario generar un token JWT para MapKit JS. Una vez lo tengamos debemos pegarlo en el archivo `webapp.js`, concretamente en la línea 10, como parámetro de la función `done`

```javascript
mapkit.init({ authorizationCallback: function(done) {
    // Pasamos como parámetro el token JWT que hemos generado previamente
    done("TOKEN-AQUÍ");
    }
});
```

## Generar el Token JWT

En [este repositorio de GitHub](https://github.com/fitomad/mapkitjs-jwt-token-generator) encontrarás un script Python que generar un token a partir del archivo de claves (.p8) y del *Key ID*.

## Contacto

Cualquier duda o pregunta me la podéis hacer en mi cuenta de twitter [@fitomad](https://twitter.com/fitomad)
