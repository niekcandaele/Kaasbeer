module.exports = class Queue {
    _queue = [];
    _fn;

    constructor(fn, options = {}) {
        // TODO: validate stuff
        const { initialValues, heartbeat, continueCheck } = options;
        this._queue.concat(initialValues);
        this.processing = false;

        if (!fn) {
            throw new TypeError('Must provide a function to execute');
        }
        this._fn = fn;
    }

    get queue() {
        return this._queue;
    }

    add(data) {
        this._queue.push(data);
        this._execute();
    }

    async _execute() {
        if (this.processing || !this._queue.length) {
            return;
        }
        this.processing = true;

        const valToExecute = this._queue.shift();
        await this._fn(valToExecute);

        if (this._queue.length) {
            this.processing = false;
            await this._execute();
        }
        this.processing = false;
    }
}