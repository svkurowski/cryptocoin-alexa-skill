import https from "https";
import querystring from "querystring";
import util from "util";

import Currency from "../models/Currency";
import Exchange from "../models/Exchange";
import IExchangeRate from "../models/IExchangeRate";
import IExchangeRateProvider from "./IExchangeRateProvider";

const ERROR_MESSAGE_FORMAT =
    "An error occurred while querying CryptoCompare (uri: %s, query: %O, response: %O)";
const OK_STATUS_CODE = 200;

export { CryptoCompareExchangeRateProvider, OK_STATUS_CODE };

export default class CryptoCompareExchangeRateProvider implements IExchangeRateProvider {
    private readonly baseUri: string;

    public constructor(baseUri: string) {
        this.baseUri = baseUri;
    }

    public getExchangeRate(
        exchange: Exchange, baseCurrency: Currency, counterCurrency: Currency): Promise<IExchangeRate> {
        const uri = this.baseUri + "/data/price";
        const query = {
            e: exchange,
            fsym: baseCurrency,
            tsyms: counterCurrency,
        };
        return get(uri, query).then((response) => {
            if (response.statusCode !== OK_STATUS_CODE) {
                throw new Error(util.format(ERROR_MESSAGE_FORMAT, uri, query, response));
            }
            const responseObj = JSON.parse(response.body);
            const exchangeRate = responseObj[counterCurrency];
            if (!exchangeRate) {
                throw new Error(util.format(ERROR_MESSAGE_FORMAT, uri, query, response));
            }
            return {
                baseCurrency,
                counterCurrency,
                exchange,
                value: responseObj[counterCurrency],
            };
        });
    }
}

function get(uri: string, query: object): Promise<{ body: string, statusCode?: number }> {
    const fullUri = uri + "?" + querystring.stringify(query);
    return new Promise<{ body: string, statusCode?: number }>((resolve, reject) => {
        https.get(fullUri, (response) => {
            let responseBody = "";
            response.on("data", (chunk) => { responseBody += chunk; });
            response.on("end", () => {
                resolve({ body: responseBody, statusCode: response.statusCode });
            });
        }).on("error", (err) => { reject(err); });
    });
}
