import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import authRouter from './router/auth.router';
import rfpRouter from './router/rfp.router';
import dashboardRouter from './router/dashboard.router';
import notificationRouter from './router/notification.router';
import { setupSwagger } from './config/swagger';
import { initializeWebSocket } from './services/websocket.service';

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/rfp', rfpRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/notifications', notificationRouter);

setupSwagger(app);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Initialize WebSocket
initializeWebSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});