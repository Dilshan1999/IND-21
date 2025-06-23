import React from 'react';
import { IndicatorPanelProps } from '../types';

const IndicatorInputGroup: React.FC<{
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children?: React.ReactNode;
}> = ({ label, checked, onCheckedChange, children }) => (
  <div className="mb-3 p-3 bg-gray-50 dark:bg-tv_dark-hover rounded-md">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700 dark:text-tv_dark-text">{label}</label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="h-4 w-4 text-blue-500 dark:text-tv_dark-accent bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-tv_dark-border rounded focus:ring-blue-500 dark:focus:ring-tv_dark-accent focus:ring-offset-1 focus:ring-offset-white dark:focus:ring-offset-tv_dark-panel cursor-pointer"
        aria-label={`Toggle ${label}`}
      />
    </div>
    {checked && children && <div className="mt-2.5 pt-2.5 border-t border-gray-200 dark:border-tv_dark-border space-y-1.5">{children}</div>}
  </div>
);

const NumberInput: React.FC<{
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  isFloat?: boolean;
}> = ({ label, value, onChange, min = 1, step = 1, isFloat = false }) => (
  <div className="flex items-center justify-between text-xs">
    <label htmlFor={`${label.replace(/\s+/g, '-')}-input`} className="text-gray-500 dark:text-tv_dark-text_secondary">{label}:</label>
    <input
      id={`${label.replace(/\s+/g, '-')}-input`}
      type="number"
      value={value}
      onChange={(e) => {
        const val = isFloat ? parseFloat(e.target.value) : parseInt(e.target.value, 10);
        if (!isNaN(val)) {
          onChange(val);
        }
      }}
      min={min}
      step={step}
      className="w-20 bg-white dark:bg-tv_dark-bg border border-gray-300 dark:border-tv_dark-border text-gray-800 dark:text-tv_dark-text rounded px-1.5 py-0.5 text-xs focus:ring-blue-500 dark:focus:ring-tv_dark-accent focus:border-blue-500 dark:focus:border-tv_dark-accent"
      aria-label={`${label} input`}
    />
  </div>
);


const IndicatorPanel: React.FC<IndicatorPanelProps> = ({
  showMA, setShowMA, maPeriod, setMAPeriod,
  showRSI, setShowRSI, rsiPeriod, setRSIPeriod,
  showBB, setShowBB, bbPeriod, setBBPeriod, bbDeviation, setBBDeviation,
  showMACD, setShowMACD, macdFastPeriod, setMACDFastPeriod, macdSlowPeriod, setMACDSlowPeriod, macdSignalPeriod, setMACDSignalPeriod,
  showVolume, setShowVolume,
  onClose // Added for modal
}) => {
  return (
    // Removed fixed width/height, modal will control this
    <div className="p-1 text-sm">
      {/* Optional: Close button if modal doesn't provide one in header */}
      {/* {onClose && (
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">&times;</button>
        </div>
      )} */}
      
      <IndicatorInputGroup label="Moving Average (MA)" checked={showMA} onCheckedChange={setShowMA}>
        <NumberInput label="Period" value={maPeriod} onChange={setMAPeriod} />
      </IndicatorInputGroup>

      <IndicatorInputGroup label="Relative Strength Index (RSI)" checked={showRSI} onCheckedChange={setShowRSI}>
         <NumberInput label="Period" value={rsiPeriod} onChange={setRSIPeriod} />
      </IndicatorInputGroup>

      <IndicatorInputGroup label="Bollinger Bands (BB)" checked={showBB} onCheckedChange={setShowBB}>
        <NumberInput label="Period" value={bbPeriod} onChange={setBBPeriod} />
        <NumberInput label="Deviation" value={bbDeviation} onChange={setBBDeviation} step={0.1} min={0.1} isFloat={true} />
      </IndicatorInputGroup>

      <IndicatorInputGroup label="MACD" checked={showMACD} onCheckedChange={setShowMACD}>
        <NumberInput label="Fast Period" value={macdFastPeriod} onChange={setMACDFastPeriod} />
        <NumberInput label="Slow Period" value={macdSlowPeriod} onChange={setMACDSlowPeriod} />
        <NumberInput label="Signal Period" value={macdSignalPeriod} onChange={setMACDSignalPeriod} />
      </IndicatorInputGroup>

      <IndicatorInputGroup label="Volume" checked={showVolume} onCheckedChange={setShowVolume}>
        {/* Volume doesn't have additional parameters */}
      </IndicatorInputGroup>
    </div>
  );
};

export default IndicatorPanel;
