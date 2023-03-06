import express from 'express';
import controllerRouting from './routes/index';

const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());

controllerRouting(app);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
