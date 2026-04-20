import { Candlestick, TechnicalIndicator } from '@/types/charting';

export interface ExportOptions {
  format: 'png' | 'svg' | 'csv' | 'json';
  includeIndicators: boolean;
  includeDrawingTools: boolean;
  includeVolume: boolean;
  resolution: 'low' | 'medium' | 'high';
  filename?: string;
}

export interface ExportData {
  candles: Candlestick[];
  indicators?: TechnicalIndicator[];
  metadata: {
    exportedAt: string;
    timeframe: string;
    candleCount: number;
    priceRange: { min: number; max: number };
  };
}

export class ChartExportService {
  async exportAsImage(
    canvas: HTMLCanvasElement,
    options: ExportOptions
  ): Promise<Blob> {
    const filename = options.filename || `chart-${Date.now()}`;

    if (options.format === 'png') {
      return this.exportAsPNG(canvas, filename);
    } else if (options.format === 'svg') {
      return this.exportAsSVG(canvas, filename);
    }

    throw new Error(`Unsupported image format: ${options.format}`);
  }

  async exportAsData(
    data: ExportData,
    options: ExportOptions
  ): Promise<Blob> {
    const filename = options.filename || `chart-data-${Date.now()}`;

    if (options.format === 'csv') {
      return this.exportAsCSV(data, filename);
    } else if (options.format === 'json') {
      return this.exportAsJSON(data, filename);
    }

    throw new Error(`Unsupported data format: ${options.format}`);
  }

  private exportAsPNG(canvas: HTMLCanvasElement, filename: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        blob => {
          if (blob) {
            this.downloadBlob(blob, `${filename}.png`);
            resolve(blob);
          } else {
            reject(new Error('Failed to export PNG'));
          }
        },
        'image/png'
      );
    });
  }

  private exportAsSVG(canvas: HTMLCanvasElement, filename: string): Promise<Blob> {
    const width = canvas.width;
    const height = canvas.height;

    const imageData = canvas.toDataURL('image/png');

    const svgContent = `
      <?xml version="1.0" encoding="UTF-8"?>
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <image width="${width}" height="${height}" href="${imageData}"/>
      </svg>
    `;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    this.downloadBlob(blob, `${filename}.svg`);
    return Promise.resolve(blob);
  }

  private exportAsCSV(data: ExportData, filename: string): Promise<Blob> {
    const headers = ['Time', 'Open', 'High', 'Low', 'Close', 'Volume'];
    const rows = data.candles.map(candle => [
      candle.time,
      candle.open.toString(),
      candle.high.toString(),
      candle.low.toString(),
      candle.close.toString(),
      candle.volume.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
    return Promise.resolve(blob);
  }

  private exportAsJSON(data: ExportData, filename: string): Promise<Blob> {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    this.downloadBlob(blob, `${filename}.json`);
    return Promise.resolve(blob);
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  generateCSVReport(data: ExportData): string {
    const report: string[] = [];

    report.push('=== CHART EXPORT REPORT ===');
    report.push(`Exported: ${data.metadata.exportedAt}`);
    report.push(`Timeframe: ${data.metadata.timeframe}`);
    report.push(`Total Candles: ${data.metadata.candleCount}`);
    report.push(
      `Price Range: ${data.metadata.priceRange.min} - ${data.metadata.priceRange.max}`
    );
    report.push('');

    report.push('OHLCV DATA');
    report.push('Time,Open,High,Low,Close,Volume');
    data.candles.forEach(candle => {
      report.push(
        `${candle.time},${candle.open},${candle.high},${candle.low},${candle.close},${candle.volume}`
      );
    });

    if (data.indicators && data.indicators.length > 0) {
      report.push('');
      report.push('TECHNICAL INDICATORS');
      data.indicators.forEach(indicator => {
        report.push(`${indicator.name}: ${indicator.value}`);
      });
    }

    return report.join('\n');
  }

  generateTechnicalAnalysisReport(
    candles: Candlestick[],
    indicators: TechnicalIndicator[]
  ): string {
    const report: string[] = [];

    if (candles.length === 0) return 'No data available';

    const firstCandle = candles[0];
    const lastCandle = candles[candles.length - 1];

    report.push('=== TECHNICAL ANALYSIS REPORT ===');
    report.push(`Generated: ${new Date().toISOString()}`);
    report.push('');

    report.push('PRICE STATISTICS');
    report.push(`Opening Price: ${firstCandle.open.toFixed(4)}`);
    report.push(`Closing Price: ${lastCandle.close.toFixed(4)}`);
    report.push(
      `Price Change: ${(lastCandle.close - firstCandle.open).toFixed(4)}`
    );
    report.push(
      `% Change: ${(((lastCandle.close - firstCandle.open) / firstCandle.open) * 100).toFixed(2)}%`
    );
    report.push('');

    report.push('PRICE RANGE');
    const prices = candles.flatMap(c => [c.open, c.high, c.low, c.close]);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    report.push(`Minimum: ${minPrice.toFixed(4)}`);
    report.push(`Maximum: ${maxPrice.toFixed(4)}`);
    report.push(`Range: ${(maxPrice - minPrice).toFixed(4)}`);
    report.push('');

    report.push('VOLUME ANALYSIS');
    const totalVolume = candles.reduce((sum, c) => sum + c.volume, 0);
    const avgVolume = totalVolume / candles.length;
    const maxVolume = Math.max(...candles.map(c => c.volume));
    const minVolume = Math.min(...candles.map(c => c.volume));
    report.push(`Total Volume: ${totalVolume.toLocaleString()}`);
    report.push(`Average Volume: ${avgVolume.toLocaleString()}`);
    report.push(`Max Volume: ${maxVolume.toLocaleString()}`);
    report.push(`Min Volume: ${minVolume.toLocaleString()}`);
    report.push('');

    if (indicators.length > 0) {
      report.push('TECHNICAL INDICATORS');
      indicators.forEach(indicator => {
        report.push(`${indicator.name}:`);
        if (typeof indicator.value === 'number') {
          report.push(`  Value: ${indicator.value.toFixed(4)}`);
        } else if (typeof indicator.value === 'object') {
          Object.entries(indicator.value).forEach(([key, val]) => {
            if (typeof val === 'number') {
              report.push(`  ${key}: ${val.toFixed(4)}`);
            }
          });
        }
      });
    }

    return report.join('\n');
  }

  canvasToDataURL(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/png');
  }

  async copyImageToClipboard(canvas: HTMLCanvasElement): Promise<void> {
    try {
      const blob = await this.canvasToBlob(canvas);
      const data = [new ClipboardItem({ 'image/png': blob })];
      await navigator.clipboard.write(data);
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
    }
  }

  private canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      });
    });
  }

  getFileSize(blob: Blob): string {
    const bytes = blob.size;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
