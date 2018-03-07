import "../support/setup";

import { expect } from "chai";
import nock from "nock";

import {
    CryptoCompareExchangeRateProvider,
    OK_STATUS_CODE,
} from "../../src/exchange_rate_providers/CryptoCompareExchangeRateProvider";
import Currency from "../../src/models/Currency";
import Exchange from "../../src/models/Exchange";

const BASE_URI = "https://localhost";
const BASE_CURRENCY = Currency.Ethereum;
const COUNTER_CURRENCY = Currency.Euro;
const EXCHANGE = Exchange.Kraken;
const EXCHANGE_RATE_VALUE = 123.4;
const ERROR_STATUS_CODE = 500;

describe("CryptoCompareExchangeRateProvider", () => {
    it("resolves with the exchange rate if there is a valid response", () => {
        const response: any = {};
        response[COUNTER_CURRENCY] = EXCHANGE_RATE_VALUE;
        getCryptoCompareApiInterceptor().reply(OK_STATUS_CODE, response);
        const provider = new CryptoCompareExchangeRateProvider(BASE_URI);

        const result = provider.getExchangeRate(EXCHANGE, BASE_CURRENCY, COUNTER_CURRENCY);

        return Promise.all([
            expect(result).to.eventually.have.property("baseCurrency", BASE_CURRENCY),
            expect(result).to.eventually.have.property("counterCurrency", COUNTER_CURRENCY),
            expect(result).to.eventually.have.property("exchange", EXCHANGE),
            expect(result).to.eventually.have.property("value", EXCHANGE_RATE_VALUE),
        ]);
    });

    it("rejects if the response status code is different from 200 OK", () => {
        const response: any = {};
        response[COUNTER_CURRENCY] = EXCHANGE_RATE_VALUE;
        getCryptoCompareApiInterceptor().reply(ERROR_STATUS_CODE, response);
        const provider = new CryptoCompareExchangeRateProvider(BASE_URI);

        const result = provider.getExchangeRate(EXCHANGE, BASE_CURRENCY, COUNTER_CURRENCY);

        return expect(result).to.be.rejected;
    });

    it("rejects if the response body has no exchange rate value", () => {
        getCryptoCompareApiInterceptor().reply(OK_STATUS_CODE, {});
        const provider = new CryptoCompareExchangeRateProvider(BASE_URI);

        const result = provider.getExchangeRate(EXCHANGE, BASE_CURRENCY, COUNTER_CURRENCY);

        return expect(result).to.be.rejected;
    });

    it("rejects if there is a connection error", () => {
        getCryptoCompareApiInterceptor().replyWithError({ code: "ECONNREFUSED" });
        const provider = new CryptoCompareExchangeRateProvider(BASE_URI);

        const result = provider.getExchangeRate(EXCHANGE, BASE_CURRENCY, COUNTER_CURRENCY);

        return expect(result).to.be.rejected;
    });
});

function getCryptoCompareApiInterceptor(): nock.Interceptor {
    return nock(BASE_URI)
        .get("/data/price")
        .query({ e: EXCHANGE, fsym: BASE_CURRENCY, tsyms: COUNTER_CURRENCY });
}
