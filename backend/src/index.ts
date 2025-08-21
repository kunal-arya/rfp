import express from 'express';
import authRouter from './router/auth.router';
import rfpRouter from './router/rfp.router';
import { setupSwagger } from './config/swagger';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/rfp', rfpRouter);

setupSwagger(app);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
