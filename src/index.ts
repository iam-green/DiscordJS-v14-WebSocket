import 'dotenv/config';
import { webSocketInit } from './websocket';

async function bootstrap() {
  await webSocketInit();
}
bootstrap();
