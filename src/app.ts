import "dotenv/config";

import express from "express";
import cors from "cors";
import http from 'http';
import { Server } from 'socket.io';

import { router } from "./routes";
import db from "./config/mongo";
import ccxt, { Dictionary, Exchange, Market } from 'ccxt';
import { logger } from "./services/logger";


// src
const PORT = process.env.PORT || 3001; // buscar el puerto en .env  variable de entorno de lo contrario 3001
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors:
    {
        // handling CORS in socket.io v4.0 - https://socket.io/docs/v4/handling-cors/
        origin: process.env.CORS_REMOTE_HOST,
        allowedHeaders: ["authorization"],
        credentials: true,
    }
});

// REST - Enable CORS for all REST routes
app.use(cors());
app.use(express.json()); // para poder recibir datos REST en formato JSON por el Body
app.use(router);

// Socket.IO - Define the connection handler
io.on('connection', (socket) => {

    const idHandShake = socket.id;
    const { nameRoom } = socket.handshake.query;
    const origin = socket.handshake.headers.origin;
    const authorization = socket.handshake.headers.authorization;

    logger.info(`Connection origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom} authorization ${authorization}`);

    // for admin and interac purposes,  notify the rest of the users who accessed
    socket.broadcast.emit('Connection', `origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);

    socket.on('disconnect', () => {
        // for admin and interac purposes,  notify the rest of the users who accessed
        logger.info(`Disconnect ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);
        socket.broadcast.emit('Disconnect', `origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);
    });

});

// Socket.IO - Send the heartbeat message to all connected clients
setInterval(() => {
    io.emit('Heartbeat', new Date);
}, 1000);

// Puro REST: app.listen(PORT, () => logger.info(`Port ready ${PORT}`)); pero para REST + SOCKETIO
httpServer.listen(PORT, () => logger.info(`Port ready ${PORT}`));

// Bitso key MohynyNEff secret 086f78ad650d1a66ca5c09aeaf0862e3
// Bittrex Public Key: 3295f6822b8640a3b79ca2203a513388
// Kraken Public Key: yBjA4d0ena7mK4n+AjE0EXbFQgSzQFKXFBCCITFqV0k2mEGTUI2BAJ1j
// Coinbase Pro Public Key: 936f4c446f3062e6ae569dd2bf8406a8
// Binance US Public Key: wnkFaCIH7bIZ3FNdl5NrEnc1Aq7aPBDbtN4aclTe9YZGxuImTfbRvruV5vfydtJI
// Kucoin Public Key: 63a3a89047bb4b00012c93f8
// Gemini: account-soYatvBLqht9U1h5ZWIa
// HitBTC Public Key: 9xWTnjv6SVwvrnM6CMQkC0bWi972vghn


// MongoDB
db().then(() => {
    logger.info("MongoDB Connection Ready");

    // CCXT stuff    
    const ccxtVersion = ccxt.version;

    {
        const exchange = new ccxt['bitso']()
        const markets = exchange.loadMarkets();
        markets.then((results: Dictionary<Market>) => {
            logger.info(`CCXT version ${ccxtVersion} bitso keys ${Object.keys(results).length}`);
        });

    }

    {
        const exchange = new ccxt['gemini'];
        exchange.loadMarkets().then((results: Dictionary<Market>) => {
            logger.info(`CCXT version ${ccxtVersion} gemini keys ${Object.keys(results).length}`);
        });
    }

    {
        const exchange = new ccxt['kucoin'];
        const markets = exchange.loadMarkets();
        markets.then((results: Dictionary<Market>) => {
            logger.info(`CCXT version ${ccxtVersion} kucoin keys ${Object.keys(results).length}`);
        });
    }

    {
        const exchange = new ccxt['coinbasepro'];
        const markets = exchange.loadMarkets();
        markets.then((results: Dictionary<Market>) => {
            logger.info(`CCXT version ${ccxtVersion} coinbasepro keys ${Object.keys(results).length}`);
        });
    }

    {
        const exchange = new ccxt['bittrex'];
        const markets = exchange.loadMarkets();
        markets.then((results: Dictionary<Market>) => {
            logger.info(`CCXT version ${ccxtVersion} bittrex keys ${Object.keys(results).length}`);
        });
    }

    {
        const exchange = new ccxt['kraken'];
        const markets = exchange.loadMarkets();
        markets.then((results: Dictionary<Market>) => {
            logger.info(`CCXT version ${ccxtVersion} kraken keys ${Object.keys(results).length}`);
        });
    }

    {
        const exchange = new ccxt['binanceus'];
        const markets = exchange.loadMarkets();
        markets.then((results: Dictionary<Market>) => {
            logger.info(`CCXT version ${ccxtVersion} binanceus keys ${Object.keys(results).length}`);
        });
    }

});





