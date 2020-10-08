import { ApplicationRef, Component, OnInit } from '@angular/core';
import { PushService } from '../services/push.service';
import { OSNotificationPayload } from '@ionic-native/onesignal/ngx';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

    notificacionesPushRecibidas: OSNotificationPayload[] = []; // Cuidado es OSNotificationPayload pues nos interesa el payload

    constructor(public pushService: PushService, private applicationRef: ApplicationRef) {

        // También se puede poner en el oninit

    }

    ngOnInit() {

        this.pushService.notificacionesPushListner.subscribe((resp: OSNotificationPayload) => {

            console.log(resp);

            this.notificacionesPushRecibidas.unshift(resp);

            // Método que muy rara vez se utiliza, fuerza a Angular a hacer el ciclo de detección de cambios nuevamente
            this.applicationRef.tick(); // No lo necesito

        });

    }

    async ionViewWillEnter() {

        // getNotificaciones devuelve una promesa de retorno de un arreglo

        this.notificacionesPushRecibidas = await this.pushService.getNotificaciones();

    }

    async borrarMensajes() {

        await this.pushService.borrarMensajes();

        this.notificacionesPushRecibidas = [];

    }

}
