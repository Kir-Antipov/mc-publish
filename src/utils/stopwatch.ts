interface StartCallback {
    (currentDate: Date, stopwatch: Stopwatch): void;
}

interface StopCallback {
    (elapsedMilliseconds: number, currentDate: Date, stopwatch: Stopwatch): void;
}

export default class Stopwatch {
    #initialDate = 0;
    #isRunning = false;
    #elapsedMilliseconds = 0;
    #onStart: StartCallback = null;
    #onStop: StopCallback = null;

    public constructor(onStart?: StartCallback, onStop?: StopCallback) {
        this.#onStart = onStart;
        this.#onStop = onStop;
    }

    public get elapsedMilliseconds(): number {
        return this.#isRunning
            ? (this.#elapsedMilliseconds + new Date().valueOf() - this.#initialDate)
            : this.#elapsedMilliseconds;
    }

    public get isRunning(): boolean {
        return this.#isRunning;
    }

    public start(): boolean {
        if (!this.#isRunning) {
            const currentDate = new Date();
            this.#initialDate = currentDate.valueOf();
            this.#isRunning = true;
            this.#onStart?.(currentDate, this);
            return true;
        }
        return false;
    }

    public stop(): boolean {
        if (this.#isRunning) {
            const currentDate = new Date();
            this.#elapsedMilliseconds += currentDate.valueOf() - this.#initialDate;
            this.#isRunning = false;
            this.#onStop?.(this.#elapsedMilliseconds, currentDate, this);
            return true;
        }
        return false;
    }

    public reset(): void {
        this.stop();
        this.#elapsedMilliseconds = 0;
    }

    public restart(): void {
        this.reset();
        this.start();
    }

    public static startNew(onStart?: StartCallback, onStop?: StopCallback): Stopwatch {
        const stopwatch = new Stopwatch(onStart, onStop);
        stopwatch.start();
        return stopwatch;
    }
}
