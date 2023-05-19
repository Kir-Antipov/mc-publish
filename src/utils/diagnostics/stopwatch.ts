/**
 * A callback type for when a {@link Stopwatch} is started.
 */
interface StartCallback {
    /**
     * @param date - The date when the {@link Stopwatch} was started.
     * @param stopwatch - The {@link Stopwatch} instance.
     */
    (date: Date, stopwatch: Stopwatch): void;
}

/**
 * A callback type for when a {@link Stopwatch} is stopped.
 */
interface StopCallback {
    /**
     * @param elapsedTime - The elapsed time in milliseconds.
     * @param date - The date when the {@link Stopwatch} was stopped.
     * @param stopwatch - The {@link Stopwatch} instance.
     */
    (elapsedTime: number, date: Date, stopwatch: Stopwatch): void;
}

/**
 * A class for measuring elapsed time.
 */
export class Stopwatch {
    /**
     * Indicates whether the stopwatch is currently running.
     */
    private _isRunning: boolean;

    /**
     * The time when stopwatch was started.
     */
    private _startTime: number;

    /**
     * The elapsed time in milliseconds since the stopwatch was started.
     */
    private _elapsedTime: number;

    /**
     * A callback function that will be called when the stopwatch is started.
     */
    private readonly _onStart?: StartCallback;

    /**
     * A callback function that will be called when the stopwatch is stopped.
     */
    private readonly _onStop?: StopCallback;

    /**
     * Creates a new instance of {@link Stopwatch}.
     *
     * @param onStart - A callback function that will be called when the stopwatch is started.
     * @param onStop - A callback function that will be called when the stopwatch is stopped.
     */
    constructor(onStart?: StartCallback, onStop?: StopCallback) {
        this._isRunning = false;
        this._startTime = 0;
        this._elapsedTime = 0;
        this._onStart = onStart;
        this._onStop = onStop;
    }

    /**
     * Gets the elapsed time in milliseconds since the stopwatch was started.
     */
    get elapsedMilliseconds(): number {
        return this._elapsedTime + (this._isRunning ? Date.now() - this._startTime : 0);
    }

    /**
     * Gets a value indicating whether the stopwatch is currently running.
     */
    get isRunning(): boolean {
        return this._isRunning;
    }

    /**
     * Starts the stopwatch.
     *
     * @returns `true` if the stopwatch was successfully started; `false` if it was already running.
     */
    start(): boolean {
        if (this._isRunning) {
            return false;
        }

        this._startTime = Date.now();
        this._isRunning = true;
        this._onStart?.(new Date(), this);
        return true;
    }

    /**
     * Stops the stopwatch.
     *
     * @returns `true` if the stopwatch was successfully stopped; `false` if it was already stopped.
     */
    stop(): boolean {
        if (!this._isRunning) {
            return false;
        }

        this._elapsedTime += Date.now() - this._startTime;
        this._isRunning = false;
        this._onStop?.(this._elapsedTime, new Date(), this);
        return true;
    }

    /**
     * Resets the stopwatch.
     */
    reset(): void {
        this.stop();
        this._elapsedTime = 0;
    }

    /**
     * Restarts the stopwatch.
     */
    restart(): void {
        this.reset();
        this.start();
    }

    /**
     * Creates a new instance of {@link Stopwatch} and starts it.
     *
     * @param onStart - A callback function that will be called when the stopwatch is started.
     * @param onStop - A callback function that will be called when the stopwatch is stopped.
     *
     * @returns The newly created and started stopwatch.
     */
    static startNew(onStart?: StartCallback, onStop?: StopCallback): Stopwatch {
        const stopwatch = new Stopwatch(onStart, onStop);
        stopwatch.start();
        return stopwatch;
    }
}
