import { Candlestick, ChartScale, CandleStyle, VolumeBarStyle } from '@/types/charting';

export class CandlestickRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private candleStyle: CandleStyle;
  private volumeStyle: VolumeBarStyle;

  constructor(
    canvas: HTMLCanvasElement,
    candleStyle: CandleStyle = {
      upColor: '#4CAF50',
      downColor: '#F44336',
      borderWidth: 1,
      wickWidth: 1,
    },
    volumeStyle: VolumeBarStyle = {
      upColor: 'rgba(76, 175, 80, 0.3)',
      downColor: 'rgba(244, 67, 54, 0.3)',
      showVolume: true,
      volumeHeight: 100,
    }
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.candleStyle = candleStyle;
    this.volumeStyle = volumeStyle;
  }

  render(candles: Candlestick[], scale: ChartScale, startIndex: number = 0): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const candleWidth = Math.max(2, scale.timePerPixel * 60 * 1000);
    const candleSpacing = candleWidth * 0.2;
    const maxVolumePixels = this.volumeStyle.volumeHeight;

    if (this.volumeStyle.showVolume) {
      this.renderVolumeAxis(maxVolumePixels);
    }

    const maxVolume = Math.max(...candles.map(c => c.volume));

    for (let i = startIndex; i < candles.length; i++) {
      const candle = candles[i];
      const x = (candle.time - scale.minTime) / scale.timePerPixel;

      if (x < -candleWidth || x > this.canvas.width) continue;

      if (this.volumeStyle.showVolume) {
        this.renderVolumeBar(x, candle, candleWidth, maxVolume, maxVolumePixels);
      }

      this.renderCandle(x, candle, candleWidth, scale);
    }
  }

  private renderCandle(x: number, candle: Candlestick, width: number, scale: ChartScale): void {
    const openY = this.priceToY(candle.open, scale);
    const closeY = this.priceToY(candle.close, scale);
    const highY = this.priceToY(candle.high, scale);
    const lowY = this.priceToY(candle.low, scale);

    const color = candle.color === 'green' ? this.candleStyle.upColor : this.candleStyle.downColor;

    this.ctx.strokeStyle = color;
    this.ctx.fillStyle = color;
    this.ctx.lineWidth = this.candleStyle.wickWidth;

    this.ctx.beginPath();
    this.ctx.moveTo(x + width / 2, highY);
    this.ctx.lineTo(x + width / 2, lowY);
    this.ctx.stroke();

    const bodyTop = Math.min(openY, closeY);
    const bodyBottom = Math.max(openY, closeY);
    const bodyHeight = Math.max(1, bodyBottom - bodyTop);

    if (candle.color === 'green' && candle.close === candle.open) {
      this.ctx.globalAlpha = 0.3;
    }

    this.ctx.fillRect(x, bodyTop, width, bodyHeight);
    this.ctx.strokeRect(x, bodyTop, width, bodyHeight);

    this.ctx.globalAlpha = 1.0;
  }

  private renderVolumeBar(x: number, candle: Candlestick, width: number, maxVolume: number, maxVolumePixels: number): void {
    const volumeHeight = (candle.volume / maxVolume) * maxVolumePixels;
    const volumeColor = candle.color === 'green' ? this.volumeStyle.upColor : this.volumeStyle.downColor;

    this.ctx.fillStyle = volumeColor;
    this.ctx.fillRect(x, this.canvas.height - volumeHeight, width, volumeHeight);
  }

  private renderVolumeAxis(height: number): void {
    this.ctx.strokeStyle = '#E0E0E0';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.canvas.height - height);
    this.ctx.lineTo(this.canvas.width, this.canvas.height - height);
    this.ctx.stroke();
  }

  private priceToY(price: number, scale: ChartScale): number {
    const normalized = (price - scale.minPrice) / (scale.maxPrice - scale.minPrice);
    return this.canvas.height * (1 - normalized);
  }

  highlightCandle(x: number, candle: Candlestick, scale: ChartScale): void {
    const candleX = (candle.time - scale.minTime) / scale.timePerPixel;
    const width = Math.max(2, scale.timePerPixel * 60 * 1000);

    this.ctx.strokeStyle = 'rgba(33, 150, 243, 0.5)';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(candleX - 2, 0, width + 4, this.canvas.height);
  }

  setStyle(style: Partial<CandleStyle>): void {
    this.candleStyle = { ...this.candleStyle, ...style };
  }

  setVolumeStyle(style: Partial<VolumeBarStyle>): void {
    this.volumeStyle = { ...this.volumeStyle, ...style };
  }
}
