import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
	cors: {
		origin: [
			"http://localhost:8080",
			"https://onboarding.thewell.solutions"
		],
	},
	namespace: 'payments'
})
export class PaymentGateway {
	@WebSocketServer()
	server: Server;

	handleConnection(client: Socket) {
		client.on('join', (data: { recordID: string }) => {
			if (data?.recordID) {
				client.join(data.recordID);
			}
		});
	}

	emitPaymentErrorToRecord(recordID: string, data: { paymentId: string; error: string }) {
		this.server.to(recordID).emit('payment_failed', data);
	}

	emitPaymentSucceededToRecord(recordID: string, data: { paymentId: string }) {
		this.server.to(recordID).emit('payment_succeeded', data);
	}
}