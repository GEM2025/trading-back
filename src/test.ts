
import { LoggerService } from "./services/logger";
import { MarketService } from "./services/market";

import { GlobalsServices } from "./services/globals";
import { OpportunitiesServices } from "./services/opportunities";

import { BehaviorSubject, Observable, Subject, asyncScheduler, combineLatest, from, interval, of } from 'rxjs';
import { bufferCount, catchError, distinctUntilChanged, filter, map, scan, take, tap } from 'rxjs/operators';
import { SymbolService } from "./services/symbol";
import { ExchangeService } from "./services/exchange";
import { Interfaces } from "./interfaces/app.interfaces";

export namespace Test {

    export const TestAlgos = async () => {

        // Test algorithm unitarily
        LoggerService.logger.info("Test::TestAlgos -------------------- TestAlgos begin");

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
        LoggerService.logger.info("Test::TestAlgos -------------------- TestAlgos end");

        GlobalsServices.ClearSymbols();

        SymbolService.DeleteSymbolByExchangeAndName("TEST_EXCHANGE", "USD/MXN");
        SymbolService.DeleteSymbolByExchangeAndName("TEST_EXCHANGE", "MXN/USD");

        SymbolService.DeleteSymbolByExchangeAndName("TEST_EXCHANGE", "MXN/EUR");
        SymbolService.DeleteSymbolByExchangeAndName("TEST_EXCHANGE", "EUR/MXN");

        SymbolService.DeleteSymbolByExchangeAndName("TEST_EXCHANGE", "USD/EUR");
        SymbolService.DeleteSymbolByExchangeAndName("TEST_EXCHANGE", "EUR/USD");
        
        let info = { seed: "", skip: 0, limit: 999999, total: undefined, results: undefined, version: "0.1" };
        const response = await MarketService.GetMarkets(info);
        for (const market of response) {
            for (const item of market.items) {
                if (item?.includes("TEST_EXCHANGE")) {
                    MarketService.DeleteMarket(market.id).then( i => i && LoggerService.logger.info(`Test::TestAlgos - Deleted test market ${i.id}`));
                    break;
                }
            }
        }

        ExchangeService.DeleteExchangebyName("TEST_EXCHANGE");

    }

    const Sleep = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // https://fireship.io/lessons/rxjs-basic-pro-tips/ - https://youtu.be/ewcoEYS85Co
    export const TestReactiveExtensions = async () => {

        LoggerService.logger.info("Test::TestReactiveExtensions -------------------- TestReactiveExtensions - Observable ");

        {
            const basic = new Observable(o => {
                o.next('A');
                o.next('B');
                o.next('C');
            });
            basic.subscribe(i => LoggerService.logger.info(i));
        }

        LoggerService.logger.info("Test::TestReactiveExtensions ------------------- TestReactiveExtensions - of ");

        var hello = "hello";

        {
            const hello$ = of(hello); // primitives
            hello$.subscribe(i => LoggerService.logger.info(i));
            LoggerService.logger.info("World");
        }

        LoggerService.logger.info("Test::TestReactiveExtensions ------------------- TestReactiveExtensions - from");

        {
            const hellos$ = from(hello); // arrays, promises or iterables
            hellos$.subscribe(i => LoggerService.logger.info(i));
        }


        LoggerService.logger.info("Test::TestReactiveExtensions ------------------- TestReactiveExtensions - async of ");

        {
            const helloa$ = of(hello, asyncScheduler); // instead of immediately, it will emit the value on the next iteration on the event loop
            helloa$.subscribe(i => LoggerService.logger.info(i));
            LoggerService.logger.info("World"); // not appears to be visible here in the single thread function
            await Sleep(300);
        }

        LoggerService.logger.info("Test::TestReactiveExtensions ------------------- TestReactiveExtensions hot/cold single/nulti ... ");

        LoggerService.logger.info("Test::TestReactiveExtensions ------------------- TestReactiveExtensions - subjects ");

        {
            // is like a hot observable with the capacity of having new values to it
            const subject = new Subject();
            subject.next("Hey"); // wont be issued as the suscription still does not exist
            subject.subscribe(i => LoggerService.logger.info(i)); // watch out that you need to have the suscription prior to the values
            subject.next("Hello");
            subject.next("World");
        }

        LoggerService.logger.info("Test::TestReactiveExtensions ------------------- TestReactiveExtensions - behavior subjects");

        {
            // is like a hot observable with the capacity of having new values to it
            const bsubject = new BehaviorSubject("Hey"); // last value will be cached for consecutive suscriptions
            bsubject.subscribe(i => LoggerService.logger.info(i)); // watch out that you need to have the suscription prior to the values
            bsubject.subscribe(i => LoggerService.logger.info(i)); // watch out that you need to have the suscription prior to the values
            bsubject.next("Hello");
            bsubject.next("World");
            bsubject.subscribe(i => LoggerService.logger.info(i)); // every suscription will receive the last value (useful for price snapshots)
        }

        LoggerService.logger.info("Test::TestReactiveExtensions ------------------- TestReactiveExtensions - operators");

        {
            // is like a hot observable with the capacity of having new values to it
            const subject = new Subject<number>();
            const modified = subject.pipe(
                filter(n => n % 2 == 0),
                map(n => Math.pow(n, 2)),
                scan((accumulated, current) => accumulated + current), // Scan sounds scary, but works just like reduce for Arrays in JavaScript. It keeps track of the accumulated total of emitted values, so you can combine the emitted values from an observable together.
                take(3),
                catchError(err => LoggerService.logger.error(err)),
            );
            modified.subscribe(i => LoggerService.logger.info(i)); // watch out that you need to have the suscription prior to the values
            subject.next(1);
            subject.next(2);
            subject.next(3);
            subject.next(4);
            subject.next(5);
            subject.next(6);
            subject.next(7);
            subject.next(8);
            subject.next(9);
            subject.next(10);
        }

        LoggerService.logger.info("Test::TestReactiveExtensions ------------------- TestReactiveExtensions - tap");

        {
            // trigger side effects from inside the observable pipe (for example, write on the database or emit a socketio operation)
            const subject = new Subject<number>();
            const modified = subject.pipe(
                tap(i => LoggerService.logger.info(i)),
                map(n => Math.pow(n, 2)),
                tap(i => LoggerService.logger.info(i)),
                catchError(err => LoggerService.logger.error(err)),
            );
            modified.subscribe(); // watch out that you need to have the suscription prior to the values
            subject.next(1);
            subject.next(2);
            subject.next(3);
            subject.next(4);
            subject.next(5);
            subject.next(6);
            subject.next(7);
            subject.next(8);
            subject.next(9);
            subject.next(10);
        }

        LoggerService.logger.info("Test::TestReactiveExtensions ------------------- TestReactiveExtensions - kalman");

        {
            // trigger side effects from inside the observable pipe (for example, write on the database or emit a socketio operation)
            const subject = new Subject<number>();
            const modified = subject.pipe(
                // debounceTime(15), // will emit the values when they stop happening for n milliseconds
                // throttleTime(15), // will emit the values every n milliseconds
                bufferCount(5), // will emit the values (all of them) whenever the tray reaches m records
                // bufferTime(5), // will emit the values (all of them) whenever the n milliseconds happen
                catchError(err => LoggerService.logger.error(err))
            );
            modified.subscribe(i => LoggerService.logger.info(i)); // every suscription will receive the last value (useful for price snapshots)
            subject.next(1);
            subject.next(2);
            subject.next(3);
            subject.next(4);
            subject.next(5);
            subject.next(6);
            subject.next(7);
            subject.next(8);
            subject.next(9);
            subject.next(10);
            await Sleep(100);
            await Sleep(100);
        }

        LoggerService.logger.info("Test::TestReactiveExtensions ------------------- TestReactiveExtensions - switchmap ");

        // one value depending on another value

        LoggerService.logger.info("Test::TestReactiveExtensions ------------------- TestReactiveExtensions - BehaviorSubjects inside objects ");

        class ViewModel {
            firstName$ = new BehaviorSubject('Planet');
            lastName$ = new BehaviorSubject('Earth');

            fullName$ = combineLatest([this.firstName$, this.lastName$]).pipe(
                map(([firstName, lastName]) => `${firstName} ${lastName}`) // RxJS combineLatest operator
            );
        }

        const viewModel = new ViewModel();
        viewModel.fullName$.subscribe(value => LoggerService.logger.info(value));

        viewModel.firstName$.next("Yo");
        viewModel.firstName$.next("Yo");
        viewModel.lastName$.next("Mama");

        LoggerService.logger.info("Test::TestReactiveExtensions ------------------- TestReactiveExtensions begin 2");

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

        LoggerService.logger.info("Test::TestReactiveExtensions ------------------- TestReactiveExtensions begin 3");

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

        LoggerService.logger.info("Test::TestReactiveExtensions ------------------- TestReactiveExtensions end");

    }

} // namespace Main
