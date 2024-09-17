import React, { useEffect, useState } from "react";

interface SymbolIconProps {
  symbol: string | undefined;
}

const SymbolIcon: React.FC<SymbolIconProps> = ({ symbol }) => {
  const [iconSrc, setIconSrc] = useState<string>("/images/logo-icon.svg"); // Default placeholder

  useEffect(() => {
    async function loadIcon() {
      try {
        if (!symbol) {
          return;
        }
        // Adjust the symbol name to match the file naming scheme
        const formattedSymbol =
          symbol?.charAt(0)?.toUpperCase() + symbol.slice(1).toLowerCase();
        const iconModule = await import(
          `@api3/logos/dist/logos/symbol/${formattedSymbol}.svg`
        );

        setIconSrc(iconModule.default.src); // Access the default export
      } catch (error) {
        console.error(`Error importing icon for symbol: ${symbol}`, error);
      }
    }

    loadIcon();
  }, [symbol]);

  return (
    <picture className={`symbol-icon ${symbol?.toLowerCase()}`}>
      <img src={iconSrc} width={50} height={50} alt={symbol} />
    </picture>
  );
};

export default SymbolIcon;
