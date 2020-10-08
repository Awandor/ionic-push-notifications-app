# Push Notifications App

Creado > `ionic start push-notifications-app blank`

Levantar el servidor > `ionic serve`

Las push notifications sólo se pueden comprobar con un dispositivo real con live reload

## One Signal

`https://onesignal.com/`

Es un servicio que nos permite enviar y recibir notificaciones push

Tiene una API que nos permite

1. Enviar notificaciones desde nuestro backend
2. Enviar notificaciones desde la app, pero no se recomienda, veremos más adelante

Creamos cuenta de usuario

Tenemos la documentación de ionic para OneSignal > `https://ionicframework.com/docs/native/onesignal`

Instalamos el plugin de OneSignal

> `ionic cordova plugin add onesignal-cordova-plugin`

> `npm install @ionic-native/onesignal`

Se usa como todos los plugin: se importa en app.module y se provee en el constructor, después hay una serie de métodos

¿Dónde lo proveemos?

El lugar correcto sería en `app.component` dentro de initializeApp > platform.ready()

Esto se ejecuta la primera vez que se inicializa la app.

Este plugin va a escuchar notificaciones en el background, incluso si la app está cerrada

Pero no queremos llenar de lógica el `app.component` así que crearemos un servicio que maneje todo lo referente a las notificaciones push

> `ionic g s services/push --skipTests=true`

Proveemos en el constructor y creamos un método `configuracionInicial` que contendrá todos los métodos de Usage de la documentacion

Ahora hay que importar el servicio en `app.component` y llamamos a nuestro método `configuracionInicial`

Hay que cambiar los ID por los nuestros, vamos a OneSignal, ponemos un nombre y no escogemos SO

Ya dentro de nuestro proyecto creado vamos a Settings > Keys & IDs, copiamos OneSignal App ID y lo pegamos como primer argumento en
`push.service` > `startInit`

El segundo argumento es el Google Project Number, para ello vamos a nuestro proyecto en Firebase


## Firebase

Usamos un proyecto o creamos uno nuevo. Entramos en el proyecto > Rueda dentada > Configuración > Cloud Messagin

En Project credentials copiamos el Sender ID y lo pegamos como segundo argumento en `push.service` > `startInit`


## Configuración Push en Android

En OneSignal vamos a Platforms > Android

Nos piden que veamos la documentación para generar unos ID > `https://documentation.onesignal.com/docs/generate-a-google-server-api-key`

Vamos al Step 2 y vemos que el Firebase Server Key lo obtenemos de Firebase > proyecto > Rueda dentada > Configuración > Cloud Messagin

Lo mismo para Firebase Sender ID

Ya podemos probar en un dispositivo Android

> `ionic cordova run android -l`

Abrimos el Inspector del navegador > Remote Devices

Vamos a OneSignal y seleccionamos target SDK > `Phonegap, Cordova, Ionic` Guardamos y se cierra la modal

Ahora vamos a Messages > New Push > Title, Message

Tenemos varias opciones más abajo como additional data

Podemos configurar colores, sonidos, de todo

En Shedule seleccionamos Send Immediatly y presionamos Confirm, se abre una modal de confirmación y deberíamos tener 1 Receptor

Enviamos y recibimos la Notificación en el móvil y en el Inspector recibimos por consola los datos, si clicamos OK recibimos también datos
por consola


## Mostrar notificaciones push recibidas en la app

En push.services creamos un arreglo vacío

En Home abrimos home.page y trabajamos el HTML, después vamos al controlador e inyectamos el servicio como public para poder acceder
desde el HTML

Ahora en push.service creamos un método que va a manejar los datos recibidos al recibir una notificación push, recibe un argumento que
es de tipo `OSNotification`

En inFocusDisplaying cambiamos InAppAlert por Notification


## Storage

Instalamos el plugin nativo > `https://ionicframework.com/docs/angular/storage`

> `ionic cordova plugin add cordova-sqlite-storage`

> npm `npm install --save @ionic/storage`

Lo importamos en app.module con .forRoot()

Ahora importamos `Storage` lo inyectamos en el constructor de push.service

Tengo unos 20-30 segundos para guardar en el Storage Nativo,
podemos manejarlo con un observable de rxjs pero lo vamos a hacer un EventEmitter de Angular (que también es un tipo de observable).

Este EventEmitter se disparará cuando recibimos la notificación y lo que emite es el payload de la respuesta

Ahora en home.page creamos un arreglo de notificaciones vacío y es el que va a recibir el evento del servicio suscribiéndose al emisor

Una vez terminado con el Storage hay que volver a ejecutar > `ionic cordova run android -l`


## Comportamiento cuando la app está cerrada en el dispositivo

Probemos a enviar una notificación push cuando la app está cerrada.

La recibimos pero al tocar la notificación y abrir la app no está en Notificaciones recibidas

Vamos a push.services > handleNotificationOpened vamos a hacer que el callback function del subscribe sea async
y ponemos await a notificacionRecibida

Como notificacionRecibida es asíncrona ponemos await también a guardarNotificacionesEnStorage

Todos los awaits nos sirven para asegurarnos de que se cumplen todos los procesos, ahora ya funciona.


## Obtener el ID único del suscriptor para enviar Notificaciones Push privadas

En push.service creamos propiedad userId y creamos un método en configuracionInicial

Ya tenemos el ID del dispositivo que funciona como ID de usuario suscrito


## OneSignal API - Mandar un mensaje desde un servicio REST

Documentación > `https://documentation.onesignal.com/reference/create-notification#create-notification`

Vamos a enviar Push Notifications desde un backend y no desde el dispositivo ya que hay que usar una API Key y no la podemos poner en
el código de la app pues sería visible y cualquiera podría enviar mensajes desde la app

Este API Key está en Settings > Keys & IDs

Vamos a simular un backend usando Postman

Vamos a la Documentación y copiamos POST > `https://onesignal.com/api/v1/notifications`

Hay una enorme cantidad de opciones.

Si corremos el POST en Postman nos dice que falta app_id y que hay que especificar Content-Type: application/json en el Header

Vamos a crear manualmente el json, en Postman > Body > Raw & JSON

El appId lo tenemos en push.service > startInit

{
    "app_id": "02cbb5f1-b294-4eeb-be6c-ac1dd997a79b",
    "included_segments": ["Active Users", "Inactive Users"],
    "contents": {"en": "English message from Postman", "es": "Mensaje en español desde Postman"},
    "headings": {"en": "Hello", "es": "Hola 6"},
    "data": {"algo": "POSTMAN-1234"}
}

Ahora en Headers añadimos key> Authorization value> Basic <Api Key>
y añadimos Content-Type: application/json

Los envíos funcionan aunque el móvil no esté conectado por USB al ordenador.


## OneSignal API - Mandar un mensaje a un usuario específico

En la documentación > `https://documentation.onesignal.com/reference/create-notification#section-send-to-specific-devices`

La clave es el parámetro `include_player_ids` su valor es un arreglo de strings con los userId que OneSignal genera

{
    "app_id": "02cbb5f1-b294-4eeb-be6c-ac1dd997a79b",
    "include_player_ids": ["d62a0b4f-b99f-4fa5-a579-1e92ab01297b"],
    "contents": {"en": "English message from Postman", "es": "Mensaje en español desde Postman"},
    "headings": {"en": "Hello specific", "es": "Hola específico"},
    "data": {"algo": "POSTMAN-1234"}
}


## Borrar mensajes recibidos

Creamos método en push.service y lo implementamos en home

Si no funciona a la primera es necesario bajar y levantar el servicio android





# GIT
Añadimos los cambios a GIT> `git add .`
Commit > `git commit -m "Primer commit"`

Si en este punto borro accidentalmente algo puedo recuperarlo con > `git checkout -- .`

Que nos recontruye los archivos tal y como estaban en el último commit.

Enlazamos el repositorio local con un repositorio externo en GitHub donde tenemos cuenta y hemos creado un repositorio
`git remote add origin https://github.com/Awandor/ionic-pelicuals-app.git`

Situarnos en la rama master > `git branch -M master`

Subir todos los cambios a la rama master remota > `git push -u origin master`

Para reconstruir en local el código de GitHub nos bajamos el código y ejecutamos `npm install` que instala todas las dependencias