
import { Trade, TradeDirection, OptionType } from './types';

export const APP_TITLE = "Trading Journal";

export const MOCK_TRADES: Trade[] = [
  {
    id: '1',
    enteredDate: '2024-07-22',
    symbol: 'AAPL',
    entryPrice: 150,
    exitPrice: 155,
    size: 10,
    optionType: OptionType.CALL,
    direction: TradeDirection.LONG,
    pnl: 500,
    returnPercentage: 33.33,
    status: 'WIN',
    strategyUsed: 'Breakout',
    closedDate: '2024-07-22',
  },
  {
    id: '2',
    enteredDate: '2024-07-21',
    symbol: 'TSLA',
    entryPrice: 700,
    exitPrice: 690,
    size: 5,
    optionType: OptionType.PUT,
    direction: TradeDirection.SHORT,
    pnl: -250,
    returnPercentage: -7.14,
    status: 'LOSS',
    strategyUsed: 'Mean Reversion',
    closedDate: '2024-07-21',
  },
  {
    id: '3',
    enteredDate: '2024-07-21',
    symbol: 'MSFT',
    entryPrice: 280,
    exitPrice: 275,
    size: 20,
    optionType: OptionType.CALL,
    direction: TradeDirection.LONG,
    pnl: -1000,
    returnPercentage: -17.86,
    status: 'LOSS',
    strategyUsed: 'Earnings Play',
    closedDate: '2024-07-21',
  },
  {
    id: '4',
    enteredDate: '2024-07-20',
    symbol: 'GOOGL',
    entryPrice: 2500,
    exitPrice: 2550,
    size: 2,
    optionType: OptionType.NONE,
    direction: TradeDirection.LONG,
    pnl: 1000,
    returnPercentage: 20,
    status: 'WIN',
    strategyUsed: 'Trend Following',
    closedDate: '2024-07-20',
  },
  {
    id: '5',
    enteredDate: '2024-07-19',
    symbol: 'AMZN',
    entryPrice: 3300,
    exitPrice: 3350,
    size: 1,
    optionType: OptionType.CALL,
    direction: TradeDirection.LONG,
    pnl: 500,
    returnPercentage: 15.15,
    status: 'WIN',
    strategyUsed: 'Support Bounce',
    closedDate: '2024-07-19',
  },
  {
    id: '6',
    enteredDate: '2024-07-18',
    symbol: 'BTCUSDT',
    entryPrice: 30000,
    exitPrice: 31000,
    size: 0.1,
    optionType: OptionType.NONE,
    direction: TradeDirection.LONG,
    pnl: 100,
    returnPercentage: 3.33,
    status: 'WIN',
    strategyUsed: 'Crypto Momentum',
    closedDate: '2024-07-18',
  },
  {
    id: '7',
    enteredDate: '2024-07-18',
    symbol: 'ETHUSDT',
    entryPrice: 2000,
    exitPrice: 1950,
    size: 1,
    optionType: OptionType.NONE,
    direction: TradeDirection.SHORT,
    pnl: -50,
    returnPercentage: -2.5,
    status: 'LOSS',
    strategyUsed: 'Crypto Resistance',
    closedDate: '2024-07-18',
  }
];

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const SHORT_DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const DONUT_CHART_COLORS = ['#34D399', '#F87171']; // WIN, LOSS
