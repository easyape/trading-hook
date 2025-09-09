// Enum for order types
export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP_LIMIT = 'STOP_LIMIT',
  STOP_MARKET = 'STOP_MARKET',
  TRAILING_STOP = 'TRAILING_STOP'
}

// Enum for order sides
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

// Enum for order status
export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL'
}

// Enum for exchanges
export enum ExchangeName {
  OKX = 'OKX',
  BINANCE = 'BINANCE',
  BYBIT = 'BYBIT',
  COINBASE = 'COINBASE'
}
