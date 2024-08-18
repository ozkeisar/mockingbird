import express from 'express';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import logger from 'morgan';
import { Socket } from 'socket.io';
import { routes } from './routers';
import swaggerOutput from './swagger_output.json';
import { initSocketIO } from './socket';
import { socketController } from './controllers/socketController';

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('etag', false);
app.use(cors());
app.use(logger('[:date[clf]] :method :url :status - :response-time ms'));

// Routes
app.use('/', routes);

const CSS_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css';

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerOutput, { customCssUrl: CSS_URL }),
);
// Serve static files
app.use(express.static('public'));

// Initialize Socket.IO
const socketIO = initSocketIO(server);

// Socket.io event handlers
socketIO.on('connection', (socket: Socket) => {
  console.log('A user connected');

  // Add your socket event handlers here
  socketController(socket);

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

export { server };
