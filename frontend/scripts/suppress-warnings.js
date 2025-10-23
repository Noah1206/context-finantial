// Suppress hydration warnings from browser extensions and TradingView logs
const originalError = console.error;
const originalLog = console.log;

console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Hydration') ||
     args[0].includes('did not match') ||
     args[0].includes('cz-shortcut-listen'))
  ) {
    return;
  }
  originalError.apply(console, args);
};

console.log = (...args) => {
  const str = typeof args[0] === 'string' ? args[0] : '';

  // Suppress TradingView widget logs
  if (
    str.includes('Chart.LegendWidget') ||
    str.includes('Quote snapshot') ||
    str.includes('TradingView') ||
    str.includes('tradingview')
  ) {
    return;
  }

  originalLog.apply(console, args);
};
