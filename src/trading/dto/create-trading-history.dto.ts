// Import our custom enum types
import { OrderType, OrderSide, OrderStatus, ExchangeName } from '../enums/trading.enums';

export class CreateTradingHistoryDto {
  userId: string;
  symbol: string;
  orderType: OrderType;
  side: OrderSide;
  price: number;
  amount: number;
  fee: number;
  totalValue: number;
  status: OrderStatus;
  exchangeId?: string;
  exchangeName: ExchangeName;
  completedAt?: Date;
}
