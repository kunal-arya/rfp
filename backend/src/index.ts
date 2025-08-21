import express from 'express';
import { createServer } from 'http';
import authRouter from './router/auth.router';
import rfpRouter from './router/rfp.router';
import dashboardRouter from './router/dashboard.router';
import { setupSwagger } from './config/swagger';
import { initializeWebSocket } from './services/websocket.service';

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/rfp', rfpRouter);
app.use('/api/dashboard', dashboardRouter);

setupSwagger(app);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Initialize WebSocket
initializeWebSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
