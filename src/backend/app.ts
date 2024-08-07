import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import {routes} from './routers';
import { socketService } from './services/socketService';
import swaggerUi from "swagger-ui-express";
import swaggerOutput from "./swagger_output.json";
import cors from "cors";
import logger from 'morgan';


const app = express();
const server = http.createServer(app);
const socketIo = new SocketIOServer(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"]
	}
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('etag',false);
app.use(cors());
app.use(logger('[:date[clf]] :method :url :status - :response-time ms'));

// Routes
app.use('/', routes);


const CSS_URL = "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css";

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOutput,  { customCssUrl: CSS_URL }));
// Serve static files
app.use(express.static('public'));

// Initialize Socket.IO
socketService(socketIo);

export { server, socketIo };
