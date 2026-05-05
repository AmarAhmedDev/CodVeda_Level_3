const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const jwt = require('jsonwebtoken');
const { initDatabase } = require('./database');
const { JWT_SECRET } = require('./middleware/auth');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Initialize Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: '*', // For development. In production, restrict to VITE_API_URL
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

// Socket.io Authentication Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: Token missing'));
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
        socket.user = decoded; // attach user to the socket
        next();
    });
});

io.on('connection', (socket) => {
    console.log(`User connected to socket: ${socket.user.email} (${socket.id})`);
    
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.email}`);
    });
});

// Security and Performance Middleware
app.use(helmet({ 
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());

// Initialize Apollo Server
const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
});

async function startServer() {
    await initDatabase();
    await apolloServer.start();

    // Setup Apollo Middleware
    app.use(
        '/graphql',
        expressMiddleware(apolloServer, {
            context: async ({ req }) => {
                // Extract token from header
                const authHeader = req.headers.authorization || '';
                const token = authHeader.replace('Bearer ', '');
                let user = null;

                if (token) {
                    try {
                        user = jwt.verify(token, JWT_SECRET);
                    } catch (err) {
                        // Invalid token, user remains null
                    }
                }

                // Inject user and Socket.io instance into context
                return { user, io };
            },
        })
    );

    server.listen(port, () => {
        console.log(`🚀 Server is running on http://localhost:${port}/graphql`);
    });
}

startServer().catch(err => {
    console.error("Failed to start server", err);
    process.exit(1);
});
