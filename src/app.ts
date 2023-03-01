import "dotenv/config";

import express from "express";
import cors from "cors";
import http from 'http';
import db from "./config/mongo";

import { Server } from 'socket.io';

import { router } from "./routes";
import { LoggerService } from "./services/logger";
import { MarketService } from "./services/market";
import { SymbolService } from "./services/symbol";
import { GlobalsServices } from "./services/globals";
import { OpportunitiesServices } from "./services/opportunities";

import { BehaviorSubject, Observable, Subject, combineLatest, from, of } from 'rxjs';
import { distinctUntilChanged, map, scan } from 'rxjs/operators';

namespace Main {

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

        LoggerService.logger.info(`Connection origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom} authorization ${authorization}`);

        // for admin and interac purposes,  notify the rest of the users who accessed
        socket.broadcast.emit('Connection', `origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);

        socket.on('disconnect', () => {
            // for admin and interac purposes,  notify the rest of the users who accessed
            LoggerService.logger.info(`Disconnect ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);
            socket.broadcast.emit('Disconnect', `origin ${origin} idHandShake ${idHandShake} user connected ${nameRoom}`);
        });

    });

    // Socket.IO - Send the heartbeat message to all connected clients
    setInterval(() => {
        io.emit('Heartbeat', new Date);
    }, 1000);

    // Puro REST: app.listen(PORT, () => LoggerService.logger.info(`Port ready ${PORT}`)); pero para REST + SOCKETIO
    httpServer.listen(PORT, () => LoggerService.logger.info(`Port ready ${PORT}`));

    // MongoDB
    db().then(async () => {

        LoggerService.logger.info("MongoDB Connection Ready");

        await TestAlgos();
        await TestReactiveExtensions();

        await SymbolService.InitializeSymbolsFromDB();
        // await MarketsService.InitializeMarketsFromDB();
        // await OpportunitiesServices.InitializeCalculations(); // opportunity calculations must be performed only once and then happen async (observable)

        // LoggerService.logger.info("+----------------------------------------+");
        // LoggerService.logger.info("| Application loaded from DB persistance |");
        // LoggerService.logger.info("+----------------------------------------+");
        // LoggerService.logger.info(`ExchangesSymbolsDict ${GlobalsServices.ExchangesSymbolsDict.size}`);
        // LoggerService.logger.info(`SymbolsDict ${GlobalsServices.SymbolsDict().size}`);
        // LoggerService.logger.info(`SymbolsSet ${GlobalsServices.SymbolsSet().size}`);

        // var sizes: Array<number> = [0, 0, 0, 0];
        // GlobalsServices.Markets.forEach(i => sizes[i.length]++);
        // LoggerService.logger.info(`Markets ${GlobalsServices.Markets.size} Duets ${sizes[2]} Triplets ${sizes[3]} Errors ${sizes[0] + sizes[1]}`);

        // await SymbolService.RefreshSymbolsFromCCXT(); // this equivalent must run realtime to keep on finding opportunities
        // await MarketsService.InitializeMarkets(); // this routine must run frequently to update pairs both in memory as in DB        


    }); // -- db().then

    const TestAlgos = async () => {

        // Test algorithm unitarily
        LoggerService.logger.info("------------------- TestAlgos begin");

        // 1. insert symbols artificially                
        GlobalsServices.InsertTestSymbol("USD", "MXN", 20, 0.01);
        GlobalsServices.InsertTestSymbol("MXN", "USD", 1 / 20, 0.005);

        GlobalsServices.InsertTestSymbol("MXN", "EUR", 1 / 30, 0.0001);
        GlobalsServices.InsertTestSymbol("EUR", "MXN", 30, 0.01);

        GlobalsServices.InsertTestSymbol("USD", "EUR", 20 / 30, 0.0001);
        GlobalsServices.InsertTestSymbol("EUR", "USD", 30 / 20, 0.0001);

        // 2. calculate markets for those
        await MarketService.InitializeMarkets();

        // 4. calculate opportunities for those
        await OpportunitiesServices.InitializeCalculations(); // opportunity calculations must be performed only once and then happen async (observable)

        // 5. insert symbols artificially                
        GlobalsServices.InsertTestSymbol("USD", "MXN", 20, 0.0);
        GlobalsServices.InsertTestSymbol("MXN", "USD", 1 / 20, 0.00);

        GlobalsServices.InsertTestSymbol("MXN", "EUR", 1 / 30, 0.000);
        GlobalsServices.InsertTestSymbol("EUR", "MXN", 30, 0.0);

        GlobalsServices.InsertTestSymbol("USD", "EUR", 20 / 30, 0.000);
        GlobalsServices.InsertTestSymbol("EUR", "USD", 30 / 20, 0.000);

        // 4. calculate opportunities for those
        await OpportunitiesServices.InitializeCalculations(); // opportunity calculations must be performed only once and then happen async (observable)

        // Test algorithm unitarily
        LoggerService.logger.info("------------------- TestAlgos end");

        GlobalsServices.ClearSymbols();

    }

    const TestReactiveExtensions = () => {

        LoggerService.logger.info("------------------- TestReactiveExtensions begin 1 ");

        class ViewModel {
            firstName$ = new BehaviorSubject('Planet');
            lastName$ = new BehaviorSubject('Earth');

            fullName$ = combineLatest([this.firstName$, this.lastName$]).pipe(
                map(([firstName, lastName]) => `${firstName} ${lastName}`)
            );
        }

        const viewModel = new ViewModel();
        viewModel.fullName$.subscribe(value => LoggerService.logger.info(value));

        viewModel.firstName$.next("Yo");
        viewModel.firstName$.next("Yo");
        viewModel.lastName$.next("Mama");

        LoggerService.logger.info("------------------- TestReactiveExtensions begin 2");

        interface Person {
            name: string;
            age: number;
        }

        const person: Person = {
            name: 'John',
            age: 30,
        };

        const ageChanges = new Subject<number>();
        ageChanges.pipe(
            map(age => `Age changed to ${age}`),
            distinctUntilChanged()
        ).subscribe(console.log);

        function updateAge(newAge: number) {
            if (person.age !== newAge) {
                person.age = newAge;
                ageChanges.next(person.age);
            }
        }

        updateAge(30); // This won't trigger a change
        updateAge(35); // This will trigger a change
        updateAge(35); // This won't trigger a change
        updateAge(40); // This will trigger a change

        LoggerService.logger.info("------------------- TestReactiveExtensions begin 3");

        const persons: Person[] = [
            { name: 'Alice', age: 30 },
            { name: 'Bob', age: 35 },
            { name: 'Charlie', age: 40 },
        ];

        const persons$ = new BehaviorSubject<Person[]>(persons);

        persons$.subscribe(persons => console.log('persons:', persons));

        const personAges$ = persons$.pipe(
            map(persons => persons.map(person => person.age)),
            distinctUntilChanged()
        );

        personAges$.subscribe(ages => console.log('ages:', ages));

        persons[0].age = 31;
        persons$.next(persons);

        LoggerService.logger.info("------------------- TestReactiveExtensions end");

    }

} // namespace Main
