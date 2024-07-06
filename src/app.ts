import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes';

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API!' });
  });
  
app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});