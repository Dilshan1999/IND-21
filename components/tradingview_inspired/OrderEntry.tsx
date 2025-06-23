import React, { useState } from 'react';
import {
    TrendingUp, TrendingDown, Target, StopCircle, Calculator,
    DollarSign, Percent, Clock, AlertCircle, Check, X
} from 'lucide-react';
import { formatPriceWithCurrency, formatPrice } from '../../utils/priceFormatting';

interface OrderEntryProps {
    isOpen: boolean;
    onClose: () => void;
    currentPrice: number;
    symbol: string;
}

interface Order {
    id: string;
    type: 'market' | 'limit' | 'stop' | 'stop-limit';
    side: 'buy' | 'sell';
    quantity: number;
    price?: number;
    stopPrice?: number;
    status: 'pending' | 'filled' | 'cancelled';
    timestamp: Date;
}

const OrderEntry: React.FC<OrderEntryProps> = ({
    isOpen,
    onClose,
    currentPrice,
    symbol
}) => {
    const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop' | 'stop-limit'>('limit');
    const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
    const [quantity, setQuantity] = useState<string>('');
    const [price, setPrice] = useState<string>(currentPrice.toString());
    const [stopPrice, setStopPrice] = useState<string>('');
    const [timeInForce, setTimeInForce] = useState<'GTC' | 'IOC' | 'FOK'>('GTC');
    
    // Risk management
    const [takeProfitEnabled, setTakeProfitEnabled] = useState(false);
    const [stopLossEnabled, setStopLossEnabled] = useState(false);
    const [takeProfitPrice, setTakeProfitPrice] = useState<string>('');
    const [stopLossPrice, setStopLossPrice] = useState<string>('');
    
    // Portfolio simulation
    const [balance] = useState(10000); // Mock USDT balance
    const [position] = useState({ size: 0, avgPrice: 0 }); // Mock position

    const [orders, setOrders] = useState<Order[]>([
        {
            id: '1',
            type: 'limit',
            side: 'buy',
            quantity: 0.1,
            price: 42000,
            status: 'pending',
            timestamp: new Date(Date.now() - 3600000)
        },
        {
            id: '2',
            type: 'market',
            side: 'sell',
            quantity: 0.05,
            status: 'filled',
            timestamp: new Date(Date.now() - 1800000)
        }
    ]);

    const calculateTotal = () => {
        const qty = parseFloat(quantity) || 0;
        const orderPrice = orderType === 'market' ? currentPrice : (parseFloat(price) || 0);
        return qty * orderPrice;
    };

    const calculatePnL = () => {
        if (position.size === 0) return 0;
        return (currentPrice - position.avgPrice) * position.size;
    };

    const getMaxQuantity = () => {
        if (orderSide === 'buy') {
            const orderPrice = orderType === 'market' ? currentPrice : (parseFloat(price) || currentPrice);
            return balance / orderPrice;
        } else {
            return Math.abs(position.size);
        }
    };

    const submitOrder = () => {
        const newOrder: Order = {
            id: Date.now().toString(),
            type: orderType,
            side: orderSide,
            quantity: parseFloat(quantity),
            price: orderType !== 'market' ? parseFloat(price) : undefined,
            stopPrice: orderType === 'stop' || orderType === 'stop-limit' ? parseFloat(stopPrice) : undefined,
            status: orderType === 'market' ? 'filled' : 'pending',
            timestamp: new Date()
        };
        
        setOrders(prev => [newOrder, ...prev]);
        
        // Reset form
        setQuantity('');
        if (orderType === 'limit') {
            setPrice(currentPrice.toString());
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900 rounded-lg shadow-2xl w-[900px] h-[700px] flex border border-gray-700">
                
                {/* Left Panel - Order Entry */}
                <div className="w-96 bg-gray-800 rounded-l-lg p-4 border-r border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Order Entry</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white p-1 rounded"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Symbol & Price Info */}
                    <div className="mb-4 p-3 bg-gray-700 rounded-lg">                        <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{symbol}</span>
                            <span className="text-green-400 font-mono">{formatPriceWithCurrency(currentPrice)}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                            24h Change: <span className="text-green-400">+2.45%</span>
                        </div>
                    </div>

                    {/* Order Type */}
                    <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-2">Order Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['market', 'limit', 'stop', 'stop-limit'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setOrderType(type as any)}
                                    className={`p-2 rounded text-sm capitalize transition-colors ${
                                        orderType === type 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                    }`}
                                >
                                    {type.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Buy/Sell Toggle */}
                    <div className="mb-4">
                        <div className="flex rounded-lg overflow-hidden">
                            <button
                                onClick={() => setOrderSide('buy')}
                                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                                    orderSide === 'buy' 
                                        ? 'bg-green-600 text-white' 
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                <TrendingUp className="w-4 h-4 inline mr-2" />
                                BUY
                            </button>
                            <button
                                onClick={() => setOrderSide('sell')}
                                className={`flex-1 py-3 px-4 font-medium transition-colors ${
                                    orderSide === 'sell' 
                                        ? 'bg-red-600 text-white' 
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                <TrendingDown className="w-4 h-4 inline mr-2" />
                                SELL
                            </button>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="mb-4">
                        <label className="block text-sm text-gray-400 mb-2">Quantity</label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.00001"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                            <button
                                onClick={() => setQuantity((getMaxQuantity() * 0.25).toFixed(5))}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300"
                            >
                                25%
                            </button>
                        </div>
                        <div className="flex mt-1 space-x-1">
                            {[25, 50, 75, 100].map(percent => (
                                <button
                                    key={percent}
                                    onClick={() => setQuantity((getMaxQuantity() * percent / 100).toFixed(5))}
                                    className="text-xs text-gray-400 hover:text-blue-400"
                                >
                                    {percent}%
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Price (for limit orders) */}
                    {orderType !== 'market' && (
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">Price</label>
                            <input
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                    )}

                    {/* Stop Price (for stop orders) */}
                    {(orderType === 'stop' || orderType === 'stop-limit') && (
                        <div className="mb-4">
                            <label className="block text-sm text-gray-400 mb-2">Stop Price</label>
                            <input
                                type="number"
                                step="0.01"
                                value={stopPrice}
                                onChange={(e) => setStopPrice(e.target.value)}
                                className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                    )}

                    {/* Order Summary */}
                    <div className="mb-4 p-3 bg-gray-700 rounded-lg">                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Total:</span>
                            <span className="text-white">{formatPriceWithCurrency(calculateTotal())}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Available:</span>
                            <span className="text-white">{formatPriceWithCurrency(balance)}</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={submitOrder}
                        disabled={!quantity || (orderType !== 'market' && !price)}
                        className={`w-full py-3 rounded-lg font-medium transition-colors ${
                            orderSide === 'buy'
                                ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-600'
                                : 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-600'
                        }`}
                    >
                        {orderSide === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
                    </button>
                </div>

                {/* Right Panel - Orders & Position */}
                <div className="flex-1 p-4">
                    
                    {/* Position Summary */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-white mb-3">Position</h4>
                        <div className="bg-gray-800 rounded-lg p-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-sm text-gray-400">Size</div>
                                    <div className="text-white font-mono">{position.size} BTC</div>
                                </div>                                <div>
                                    <div className="text-sm text-gray-400">Avg Price</div>
                                    <div className="text-white font-mono">{formatPriceWithCurrency(position.avgPrice)}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-400">Unrealized PnL</div>                                    <div className={`font-mono ${calculatePnL() >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ${formatPrice(Math.abs(calculatePnL()), 2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Active Orders */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Orders</h4>
                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {orders.map((order) => (
                                <div key={order.id} className="bg-gray-800 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-2 h-2 rounded-full ${
                                                order.status === 'filled' ? 'bg-green-400' :
                                                order.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                                            }`} />
                                            <span className={`text-sm font-medium ${
                                                order.side === 'buy' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {order.side.toUpperCase()} {order.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {order.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                        <div>
                                            <div className="text-gray-400">Qty</div>
                                            <div className="text-white">{order.quantity}</div>
                                        </div>                                        <div>
                                            <div className="text-gray-400">Price</div>
                                            <div className="text-white">
                                                {order.price ? formatPriceWithCurrency(order.price) : 'Market'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-gray-400">Status</div>
                                            <div className="text-white capitalize">{order.status}</div>
                                        </div>
                                    </div>
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => setOrders(prev => prev.filter(o => o.id !== order.id))}
                                            className="mt-2 text-red-400 hover:text-red-300 text-xs"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderEntry;
