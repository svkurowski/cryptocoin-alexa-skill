import Currency from "../models/Currency";
import Exchange from "../models/Exchange";
import IExchangeRate from "../models/IExchangeRate";

export default interface IExchangeRateProvider {
    getExchangeRate: (exchange: Exchange, baseCurrency: Currency, counterCurrency: Currency)
        => Promise<IExchangeRate>;
}
