import { EventEmitter, Injectable } from '@angular/core';

import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
    providedIn: 'root'
})
export class PushService {

    // notificacionesPushRecibidas: any[] = [];
    notificacionesPushRecibidas: OSNotificationPayload[] = []; // Cuidado es OSNotificationPayload pues nos interesa el payload

    notificacionesPushListner = new EventEmitter<OSNotificationPayload>();

    userId: string;

    constructor(private oneSignal: OneSignal, private storage: Storage) {

        this.cargarNotificacionesDelStorage();

    }

    configuracionInicial() {

        this.oneSignal.startInit('02cbb5f1-b294-4eeb-be6c-ac1dd997a79b', '728051470485');

        this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

        this.oneSignal.handleNotificationReceived().subscribe((noti) => {

            // do something when notification is received

            console.log('Notificación recibida', noti);

            this.notificacionRecibida(noti);

        });

        this.oneSignal.handleNotificationOpened().subscribe(async (resp) => {

            // do something when a notification is opened

            console.log('Notificación abierta', resp);

            await this.notificacionRecibida(resp.notification);

        });

        // Obtener ID del suscriptor

        this.oneSignal.getIds().then(info => {

            this.userId = info.userId;

            console.log(this.userId);

        });

        this.oneSignal.endInit();

    }

    async notificacionRecibida(noti: OSNotification) {

        // Paranoia?
        // Esperamos a que los cargue
        await this.cargarNotificacionesDelStorage();

        const payload = noti.payload;

        const existeNotificacion = this.notificacionesPushRecibidas.find(resp => {

            return (resp.notificationID === payload.notificationID);

        });

        if (existeNotificacion) {

            return;

        }

        this.notificacionesPushRecibidas.unshift(payload);

        this.notificacionesPushListner.emit(payload);

        await this.guardarNotificacionesEnStorage();

    }

    async guardarNotificacionesEnStorage() {

        this.storage.set('pushNotifications', this.notificacionesPushRecibidas);

    }

    async cargarNotificacionesDelStorage() {

        // get retorna una promesa, vamos a manejarla con await y async

        // this.storage.get('pushNotifications');

        // Si el Storage está vacío retornará NULL por lo que hay que controlarlo

        this.notificacionesPushRecibidas = await this.storage.get('pushNotifications') || [];

    }

    // Creamos un método asíncrono que retorna un arreglo de las notificaciones cargadas por cargarNotificacionesDelStorage

    async getNotificaciones() {

        await this.cargarNotificacionesDelStorage();

        return [...this.notificacionesPushRecibidas];

    }

    async borrarMensajes() {

        console.log('borrar');

        // this.storage.clear(); // Borra todo el Storage
        await this.storage.remove('pushNotifications'); // Borra del Storage lo que se encuentra en pushNotifications

        this.notificacionesPushRecibidas = [];

        this.guardarNotificacionesEnStorage();

    }

}
