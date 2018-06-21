# AppleCoding-MapKitJS

Sitio web que acompaña al artículo de Apple Coding sobre MapKit JS

![Webshot]()

## Configuración

Antes de arrancar el website es necesario generar un token JWT para MapKit JS. Una vez lo tengamos debemos pegarlo en el archivo `webapp.js`, concretamento en la línea 10, como parámetro de la función `done`

```javascript
mapkit.init({ authorizationCallback: function(done) {
    // Pasamos como parámetro el token JWT que hemos generado previamente
    done("TOKEN-AQUÍ");
    }
});
```
