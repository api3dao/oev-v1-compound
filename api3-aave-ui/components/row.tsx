import React from "react";
import Image from "next/image";

interface RowProps {
  ticker: string;
  name: string;
  children: React.ReactNode;
  subtitle: React.ReactNode;
}

const Row: React.FC<RowProps> = ({ ticker, name, subtitle, children }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-y-3 bg-lightBlack p-4 w-full justify-between rounded-md">
      <div className="flex gap-3 items-center w-fit">
        <Image
          src={`/logos/${ticker}.png`}
          width={24}
          height={24}
          alt={ticker}
        />
        <div className="flex flex-col h-full">
          <p className="text-md font-semibold">{name}</p>
          {/* Well the balances will show even if wallet is not connected because it's not functional */}
          <div className="flex gap-4 text-disabled">{subtitle}</div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default Row;
