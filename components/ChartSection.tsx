import React from 'react';
import CustomChart from './CustomChart';
import { Candle } from '../types';

interface ChartSectionProps {
  plotRef: React.RefObject<HTMLDivElement>;
  theme: string;
  candles?: Candle[];
  showMA?: boolean;
  maPeriod?: number;
  showRSI?: boolean;
  rsiPeriod?: number;
  showBB?: boolean;
  bbPeriod?: number;
  bbStdDev?: number;
  showMACD?: boolean;
  macdFast?: number;
  macdSlow?: number;
  macdSignal?: number;
  showVolume?: boolean;
}

const ChartSection: React.FC<ChartSectionProps> = ({
  plotRef,
  theme,
  candles = [],
  showMA = true,
  maPeriod = 20,
  showRSI = false,
  rsiPeriod = 14,
  showBB = false,
  bbPeriod = 20,
  bbStdDev = 2,
  showMACD = false,
  macdFast = 12,
  macdSlow = 26,
  macdSignal = 9,
  showVolume = true,
}) => {
  return (
    <section className="flex-grow flex flex-col relative w-full h-full">
      {/* Use the plotRef div as a fallback container, but render CustomChart */}
      <div ref={plotRef} className="w-full h-full min-h-[200px]">
        <CustomChart
          candles={candles}
          theme={theme as 'dark' | 'light'}
          showMA={showMA}
          maPeriod={maPeriod}
          showRSI={showRSI}
          rsiPeriod={rsiPeriod}
          showBB={showBB}
          bbPeriod={bbPeriod}
          bbStdDev={bbStdDev}
          showMACD={showMACD}
          macdFast={macdFast}
          macdSlow={macdSlow}
          macdSignal={macdSignal}
          showVolume={showVolume}
          height={600}
        />
      </div>
    </section>
  );
};

export default ChartSection;