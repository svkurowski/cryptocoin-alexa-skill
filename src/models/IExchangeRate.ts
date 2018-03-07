import Currency from "./Currency";
import Exchange from "./Exchange";

export default interface IExchangeRate {
    baseCurrency: Currency;
    counterCurrency: Currency;
    exchange: Exchange;
    value: number;
}
