/* */
var venues = Array();

/* Inicializamos el mapa */

let mapCustomColor = [ "#51d0f1", "#ff506c", "#fbe43e", "#b4f922", "#fd8c02" ];

mapkit.init({ authorizationCallback: function(done) {
    // Pasamos como parámetro el token JWT que hemos generado previamente
    done("");
    }
});

let attributes = {
    center : new mapkit.Coordinate(40.416745, -3.703541)
};

let map = new mapkit.Map("map", attributes);

/*
    SEARCH
*/

element("placeName").addEventListener("keypress", function(event) {
    if(event.keyCode != 13)
    {
        return;
    }

    clearPreviousAnnotations();

    translationToMap();

    let address = element("placeName").value;
    let search = new mapkit.Search();

    search.search(address, function(error, results) {
        if (error) {
            console.log(error);
            return;
        }

        var annotations = results.places.map(function(place) {
            var annotation = new mapkit.MarkerAnnotation(place.coordinate);
            annotation.title = place.name;
            annotation.subtitle = place.formattedAddress;
            annotation.color = mapCustomColor[0];
            return annotation;
        });

        map.showItems(annotations);
    });
});

function clearPreviousAnnotations()
{
    let annotations = map.annotations;
    map.removeAnnotations(annotations);
}

/*
    RUTAS
*/

function traceRoute(multiRoute)
{
    let origin = element("placeOrigin").value;
    let destination = element("placeDestination").value;

    let directionRequest = {
        origin : origin,
        destination : destination,
        transportType : mapkit.Directions.Transport.Automobile,
        requestsAlternateRoutes : multiRoute
    };

    let directions = new mapkit.Directions();

    directions.route(directionRequest, function(error, results) {
        if(error)
        {
            console.log(error);
            return;
        }

        var coordinates = Array();
        var routeCounter = 0;

        results.routes.forEach(function(route) {
            route.path.forEach(function(step) {
                step.forEach(function(coordinate) {
                    coordinates.push(coordinate);
                });
            });
            
            drawRoute(coordinates, mapCustomColor[routeCounter], true);
            showRoutePlan(routeCounter, route.distance, route.expectedTravelTime, route.steps);
                
            // Preparados para la siguiente ruta
            coordinates = Array();
            routeCounter++;

            if(routeCounter > 2)
            {
                return;
            }
        });
    });
}

function clearPreviousRoutes()
{
    let overlays = map.overlays;
    map.removeOverlays(overlays);
}

/*

*/
function drawRoute(coordinates, color, centered)
{
    let origin = coordinates[0];
    let destination = coordinates[coordinates.length - 1]

    if(centered)
    {
        centerMapBetween(origin, destination);
    }
    
    var style = new mapkit.Style({
        lineWidth: 6,
        lineJoin: "bevel",
        lineCap: "round",
        strokeColor: color
    });
    
    var polyline = new mapkit.PolylineOverlay(coordinates, { style: style });
    map.addOverlay(polyline);
}

/*

*/
function formattedDistance(distance)
{
    if(distance < 1000)
    {
        return (distance + " M");
    }
    else
    {
        return (Math.round((distance / 1000)) + " KM");
    }
}

/*

*/
function formattedTravelTime(travelTime)
{
    var time = travelTime / 60;

    if(time < 60)
    {
        return (Math.round(time) + " MIN");
    }
    else
    {
        return (Math.round((time / 60)) + " H");
    }
}

/*
 * 
 */
function showRoutePlan(routeID, distance, travelTime, steps)
{
    element("routePlan").style.visibility = "visible";

    // NOMBRE

    element("routeID").innerText = "Ruta " + (routeID + 1);

    // DISTANCIA

    element("routeDistance").innerText = formattedDistance(distance);


    // TIEMPO

    element("routeTravelTime").innerText = formattedTravelTime(travelTime);


    // INSTRUCCIONES

    var stepsDiv = steps.map(function(step) {
        var theDiv = "<div><p class=\"routeStep\">" + step.instructions + "</p><p class=\"routeStepDetail\"><small>DISTANCIA: " + formattedDistance(step.distance)  + "</small></div>";

        return theDiv;
    });

    element("routePlanContent").innerHTML = stepsDiv;
}

/*

*/
function centerMapBetween(coordOne, coordTwo)
{
    let longitudeMax = coordOne.longitude > coordTwo.longitude ? coordOne.longitude : coordTwo.longitude;
    let longitudeMin = coordOne.longitude < coordTwo.longitude ? coordOne.longitude : coordTwo.longitude;

    let latitudeMax = coordOne.latitude > coordTwo.latitude ? coordOne.latitude : coordTwo.latitude;
    let latitudeMin = coordOne.latitude < coordTwo.latitude ? coordOne.latitude : coordTwo.latitude;
    

    let boundingRegion = new mapkit.BoundingRegion(latitudeMax, longitudeMax, latitudeMin, longitudeMin);
    let region = boundingRegion.toCoordinateRegion();

    map.setRegionAnimated (region, true);
}

/*
    PUNTOS A COORDENADAS
*/

element("map").addEventListener("click", function(event) {
    var domPoint = new DOMPoint();
    domPoint.x = event.pageX;
    domPoint.y = event.pageY;

    let coordinate = map.convertPointOnPageToCoordinate(domPoint);

    addressFromCoordinate(coordinate);
});

/*
    GEOCODER
*/

function addressFromCoordinate(coordinate)
{
    let geocoder = new mapkit.Geocoder();

    geocoder.reverseLookup(coordinate, function(error, data) {
        let latitude = data.results[0].coordinate.latitude;
        let longitude = data.results[0].coordinate.longitude;
        let formattedAddress = data.results[0].formattedAddress;

        console.log("Coordinates (%f, %f) == Address (%s)", latitude, longitude, formattedAddress);
    });
}


/*
    CAPA DE DATOS - CERVANTES
*/

function cervantesAnnotationSelected(event)
{
    let coordinate = new mapkit.Coordinate(this.spatial.latitude, this.spatial.longitude);
    map.setCenterAnimated(coordinate, true);

    element("information").style.visibility = "visible";

    element("venueTitle").innerHTML = this.title;
    element("venueDescription").innerHTML = this.description;
}

/*

*/
async function loadCervantesLayer()
{
    var httpRequest = new XMLHttpRequest();
    var cervantes_url = "data/cervantes_es.json";

    httpRequest.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            venues = JSON.parse(this.responseText);

            let annotations = venues.map(function(venue) {
                let coordinate = new mapkit.Coordinate(venue.spatial.latitude, venue.spatial.longitude);

                var annotation = new mapkit.MarkerAnnotation(coordinate);
                annotation.title = venue.title;
                annotation.subtitle = venue.spatial.address;
                annotation.color = mapCustomColor[1];

                annotation.addEventListener("select",cervantesAnnotationSelected, venue);

                return annotation;
            });

            map.showItems(annotations);
        }
    };

    httpRequest.open("GET", cervantes_url, true);
    httpRequest.send();
}

/*
    CAPA DE DATOS - AUSTRIAS
*/

function routeBetweenCoordinates(origin, destination)
{
    let directionRequest = {
        origin : origin,
        destination : destination,
        transportType : mapkit.Directions.Transport.Walking,
        requestsAlternateRoutes : false
    };

    let directions = new mapkit.Directions();

    directions.route(directionRequest, function(error, results) {
        if(error)
        {
            return;
        }

        var coordinates = Array();

        results.routes.forEach(function(route) {
            route.path.forEach(function(step) {
                step.forEach(function(coordinate) {
                    coordinates.push(coordinate);
                });
            });
            
            drawRoute(coordinates, mapCustomColor[0], false);
        });
    });
}

function austriasAnnotationSelected(event)
{
    let coordinate = new mapkit.Coordinate(this.spatial.latitude, this.spatial.longitude);
    map.setCenterAnimated(coordinate, true);

    element("information").style.visibility = "visible";

    element("venueTitle").innerHTML = this.title;
    element("venueDescription").innerHTML = this.description;
}

async function loadAustriasLayer()
{
    var httpRequest = new XMLHttpRequest();
    var austrias_url = "data/austrias_es.json";

    httpRequest.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            venues = JSON.parse(this.responseText);

            // Annotations
            let annotations = venues.map(function(venue) {
                let coordinate = new mapkit.Coordinate(venue.spatial.latitude, venue.spatial.longitude);

                let options = {
                    url : {
                        1 : "images/venues/" + venue.id + "@1x.png",
                        2 : "images/venues/" + venue.id + "@2x.png",
                        3 : "images/venues/" + venue.id + "@3x.png"
                    },
                    size : {
                        width : 50,
                        height : 50
                    },
                    accessibilityLabel : venue.title
                };

                var annotation = new mapkit.ImageAnnotation(coordinate, options);

                // Clustering setup
                annotation.clusteringIdentifier = "AustriasCollectionCluster";
                annotation.collisionMode = mapkit.Annotation.CollisionMode.Circle;
                annotation.displayPriority = mapkit.Annotation.DisplayPriority.High;

                annotation.addEventListener("select",austriasAnnotationSelected, venue);

                return annotation;
            });

            map.showItems(annotations);

            // Ruta
            for(var x = 0; x < (venues.length - 1); x++)
            {
                let origin = new mapkit.Coordinate(venues[x].spatial.latitude, venues[x].spatial.longitude);
                let destination = new mapkit.Coordinate(venues[x + 1].spatial.latitude, venues[x + 1].spatial.longitude);

                routeBetweenCoordinates(origin, destination);
            }
        }
    };

    httpRequest.open("GET", austrias_url, true);
    httpRequest.send();
}

/*
    CAPA DE DATOS - EN DETALLE
*/

function detailedAnnotationSelected(event)
{
    let latitude = parseFloat(this.geo.latitude);
    let longitude = parseFloat(this.geo.longitude);

    let coordinate = new mapkit.Coordinate(latitude, longitude);

    map.setCenterAnimated(coordinate, true);

    element("information").style.visibility = "visible";

    element("venueTitle").innerHTML = this.name;
    element("venueDescription").innerHTML = this.info;

    if(this.contact)
    {
        if(this.contact.web)
        {
            element("linkVenueWebsite").href = this.contact.web;
        }

        if(this.contact.email)
        {
            element("linkVenueMail").href = "mailto:" + this.contact.email;
        }

        if(this.contact.phone)
        {
            element("linkVenuePhone").href = "phone:" + this.contact.phone;
        }
    }
}

async function loadDetailedLayer()
{
    var httpRequest = new XMLHttpRequest();
    var austrias_url = "data/mad_es.json";

    httpRequest.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            venues = JSON.parse(this.responseText);

            // Annotations
            let annotations = venues.map(function(venue) {
                let latitude = parseFloat(venue.geo.latitude);
                let longitude = parseFloat(venue.geo.longitude);

                let coordinate = new mapkit.Coordinate(latitude, longitude);

                var annotation = new mapkit.MarkerAnnotation(coordinate);
                
                // Clustering setup
                annotation.clusteringIdentifier = "DetailedCollectionCluster";
                annotation.collisionMode = mapkit.Annotation.CollisionMode.Circle;
                annotation.displayPriority = mapkit.Annotation.DisplayPriority.High;
                
                switch(venue.category.category_id)
                {
                    case 7172:
                        annotation.color = mapCustomColor[0];
                        break;
                    case 7173:
                        annotation.color = mapCustomColor[1];
                        break;
                    case 7174:
                        annotation.color = mapCustomColor[2];
                        break;
                    case 7171:
                        annotation.color = mapCustomColor[3];
                        break;
                    default:
                        annotation.color = mapCustomColor[4];
                        break;
                }
                

                annotation.addEventListener("select", detailedAnnotationSelected, venue);

                return annotation;
            });

            map.showItems(annotations);
        }
    };

    httpRequest.open("GET", austrias_url, true);
    httpRequest.send();
}


/*
    EVENTOS - MENU
*/

function translationToMap()
{
    var body = $("html, body");
    body.stop().animate({scrollTop:$(document).height()}, 750, 'swing');
}

element("buttonCervantes").addEventListener("click", function(event) {
    cleanMap();

    closeNavBar();

    loadCervantesLayer();

    translationToMap();
});

element("buttonAustrias").addEventListener("click", function(event) {
    cleanMap();

    closeNavBar();

    loadAustriasLayer();

    translationToMap();
});

element("buttonEnDetalle").addEventListener("click", function(event) {
    cleanMap();

    closeNavBar();
    
    loadDetailedLayer();

    translationToMap();
});

/*
    EVENTOS - FORMULARIO MAPA
*/

element("radioRoute").addEventListener("click", function(event) {
    element("spanName").style.display = "none";
    element("spanRoute").style.display = "inline";
});

element("radioSearch").addEventListener("click", function(event) {
    element("spanName").style.display = "inline";
    element("spanRoute").style.display = "none";
});

element("placeOrigin").addEventListener("keypress", function(event) {
    if(event.keyCode != 13)
    {
        return;
    }

    let multiRoute = element("checkVariasRutas").checked;

    cleanMap();

    translationToMap();

    traceRoute(multiRoute);
});

element("placeDestination").addEventListener("keypress", function(event) {
    if(event.keyCode != 13)
    {
        return;
    }

    let multiRoute = element("checkVariasRutas").checked;

    cleanMap();

    translationToMap();

    traceRoute(multiRoute);
});

/*
 HELPER
*/

function cleanMap()
{
    closeDetailView();
    closeRoutePlanView();

    clearPreviousRoutes();
    clearPreviousAnnotations();
}

function parseHTMLString(htmlString)
{
    var txt = document.createElement("textarea");
    txt.innerHTML = htmlString;

    return txt.value;
}

function element(id)
{
    return document.getElementById(id);
}

/*
    Start...
*/

element("spanName").style.display = "inline";
element("spanRoute").style.display = "none";
