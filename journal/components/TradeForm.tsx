
import React, { useState, useEffect } from 'react';
import { Trade, TradeDirection, OptionType } from '../types';

interface TradeFormProps {
  onSubmit: (trade: Trade) => void;
  onClose: () => void;
  initialTrade?: Trade | null;
}

const TradeForm: React.FC<TradeFormProps> = ({ onSubmit, onClose, initialTrade }) => {
  const [trade, setTrade] = useState<Partial<Trade>>(
    initialTrade || {
      direction: TradeDirection.LONG,
      optionType: OptionType.NONE,
      enteredDate: new Date().toISOString().split('T')[0], // Default to today
    }
  );

  useEffect(() => {
    if (initialTrade) {
      setTrade(initialTrade);
    }
  }, [initialTrade]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number | string[] = value;
    if (type === 'number' || name === 'entryPrice' || name === 'exitPrice' || name === 'size' || name === 'pnl') {
      processedValue = value === '' ? '' : parseFloat(value);
    } else if (name === 'mistakesMade' || name === 'lessonsLearned' || name === 'emotions' || name === 'tags') {
      processedValue = value.split(',').map(s => s.trim()).filter(s => s !== '');
    }
    
    setTrade(prev => ({ ...prev, [name]: processedValue }));
  };
  
   const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trade.symbol || !trade.entryPrice || !trade.size || !trade.enteredDate) {
        alert("Please fill in all required fields: Symbol, Entry Price, Size, Entered Date.");
        return;
    }

    const pnl = trade.exitPrice && trade.entryPrice && trade.size
        ? (trade.exitPrice - trade.entryPrice) * trade.size * (trade.direction === TradeDirection.SHORT ? -1 : 1)
        : undefined;
    
    const returnPercentage = pnl && trade.entryPrice && trade.size && trade.entryPrice * trade.size !== 0
        ? (pnl / (trade.entryPrice * trade.size)) * 100
        : undefined;

    const status = pnl === undefined ? undefined : (pnl > 0 ? 'WIN' : (pnl < 0 ? 'LOSS' : 'BREAKEVEN'));


    const finalTrade: Trade = {
      id: initialTrade?.id || Date.now().toString(),
      symbol: trade.symbol!,
      enteredDate: trade.enteredDate!,
      direction: trade.direction!,
      entryPrice: Number(trade.entryPrice!),
      size: Number(trade.size!),
      optionType: trade.optionType || OptionType.NONE,
      exitPrice: trade.exitPrice !== undefined && trade.exitPrice !== null ? Number(trade.exitPrice) : undefined,
      closedDate: trade.closedDate,
      pnl: pnl !== undefined ? Number(pnl.toFixed(2)) : undefined,
      returnPercentage: returnPercentage !== undefined ? Number(returnPercentage.toFixed(2)) : undefined,
      status: status,
      strategyUsed: trade.strategyUsed,
      reasonForEntry: trade.reasonForEntry,
      reasonForExit: trade.reasonForExit,
      mistakesMade: trade.mistakesMade,
      lessonsLearned: trade.lessonsLearned,
      emotions: trade.emotions,
      tags: trade.tags,
      notes: trade.notes,
    };
    onSubmit(finalTrade);
  };


  const inputClass = "w-full p-2 bg-slate-700 border border-slate-600 rounded focus:ring-2 focus:ring-brand-accent focus:border-brand-accent outline-none";
  const labelClass = "block text-sm font-medium text-slate-300 mb-1";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-brand-bg w-full max-w-2xl p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6 text-brand-text">{initialTrade ? 'Edit Trade' : 'Add New Trade'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="symbol" className={labelClass}>Symbol*</label>
              <input type="text" name="symbol" id="symbol" value={trade.symbol || ''} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="enteredDate" className={labelClass}>Entered Date*</label>
              <input type="date" name="enteredDate" id="enteredDate" value={trade.enteredDate || ''} onChange={handleChange} className={inputClass} required/>
            </div>
            <div>
              <label htmlFor="direction" className={labelClass}>Direction*</label>
              <select name="direction" id="direction" value={trade.direction} onChange={handleChange} className={inputClass} required>
                <option value={TradeDirection.LONG}>Long</option>
                <option value={TradeDirection.SHORT}>Short</option>
              </select>
            </div>
            <div>
              <label htmlFor="optionType" className={labelClass}>Option Type</label>
              <select name="optionType" id="optionType" value={trade.optionType} onChange={handleChange} className={inputClass}>
                <option value={OptionType.NONE}>None (Stock/Crypto/Futures)</option>
                <option value={OptionType.CALL}>Call</option>
                <option value={OptionType.PUT}>Put</option>
              </select>
            </div>
            <div>
              <label htmlFor="entryPrice" className={labelClass}>Entry Price*</label>
              <input type="number" step="any" name="entryPrice" id="entryPrice" value={trade.entryPrice || ''} onChange={handleChange} className={inputClass} required />
            </div>
             <div>
              <label htmlFor="size" className={labelClass}>Size (Contracts/Shares)*</label>
              <input type="number" step="any" name="size" id="size" value={trade.size || ''} onChange={handleChange} className={inputClass} required />
            </div>
            <div>
              <label htmlFor="exitPrice" className={labelClass}>Exit Price</label>
              <input type="number" step="any" name="exitPrice" id="exitPrice" value={trade.exitPrice === undefined ? '' : trade.exitPrice} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="closedDate" className={labelClass}>Closed Date</label>
              <input type="date" name="closedDate" id="closedDate" value={trade.closedDate || ''} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold pt-4 border-t border-slate-700 mt-6 text-brand-text-muted">Optional Details</h3>
           <div>
              <label htmlFor="strategyUsed" className={labelClass}>Strategy Used</label>
              <input type="text" name="strategyUsed" id="strategyUsed" value={trade.strategyUsed || ''} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label htmlFor="reasonForEntry" className={labelClass}>Reason for Entry</label>
              <textarea name="reasonForEntry" id="reasonForEntry" value={trade.reasonForEntry || ''} onChange={handleChange} className={inputClass} rows={2}></textarea>
            </div>
            <div>
              <label htmlFor="reasonForExit" className={labelClass}>Reason for Exit</label>
              <textarea name="reasonForExit" id="reasonForExit" value={trade.reasonForExit || ''} onChange={handleChange} className={inputClass} rows={2}></textarea>
            </div>
             <div>
              <label htmlFor="notes" className={labelClass}>Journal Notes</label>
              <textarea name="notes" id="notes" value={trade.notes || ''} onChange={handleChange} className={inputClass} rows={3}></textarea>
            </div>
             <div>
              <label htmlFor="tags" className={labelClass}>Tags (comma separated)</label>
              <input type="text" name="tags" id="tags" value={trade.tags?.join(', ') || ''} onChange={handleChange} className={inputClass} placeholder="e.g., breakout, fomo, good execution"/>
            </div>


          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-700 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded text-white transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-brand-accent hover:bg-blue-500 rounded text-white transition-colors">
              {initialTrade ? 'Save Changes' : 'Add Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeForm;
