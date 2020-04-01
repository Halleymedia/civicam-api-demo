class Estimate
{
    /**
    @type {string}
    */
    id;

    /**
    @type {Number}
    */
    amount;

    /**
    @type {string}
    */
    currency;

    /**
    @public
    @function toString
    @returns {string}
    */
    toString() {
        return `${this.currency} ${this.amount}`;
    }

    /**
    @public
    @static
    @function fromResult
    @param {any} result
    @returns {Estimate}
    */
    static fromResult(result) {
        const estimate = new Estimate();
        estimate.id = result.id;
        estimate.amount = result.estimate.amount;
        estimate.currency = result.estimate.currency;
        return estimate;
    }
}
export default Estimate;