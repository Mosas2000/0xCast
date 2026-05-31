import { BatchRequest } from '@/types/batch';

export class BatchDataSerializer {
  static serialize(batch: BatchRequest): string {
    return JSON.stringify(batch);
  }

  static deserialize(data: string): BatchRequest {
    return JSON.parse(data);
  }

  static toCompressed(batch: BatchRequest): Buffer {
    const json = JSON.stringify(batch);
    return Buffer.from(json, 'utf-8');
  }

  static fromCompressed(buffer: Buffer): BatchRequest {
    const json = buffer.toString('utf-8');
    return JSON.parse(json);
  }
}

export class BatchEncoding {
  static encodeTransaction(txData: any): string {
    return btoa(JSON.stringify(txData));
  }

  static decodeTransaction(encoded: string): any {
    return JSON.parse(atob(encoded));
  }

  static encodeAddress(address: string): string {
    return address.toLowerCase().padEnd(42, '0');
  }

  static decodeAddress(encoded: string): string {
    return encoded.trim().toLowerCase();
  }
}

export class BatchCRC {
  static calculateChecksum(batch: BatchRequest): string {
    const data = JSON.stringify(batch);
    let checksum = 0;
    for (let i = 0; i < data.length; i++) {
      checksum = ((checksum << 5) - checksum) + data.charCodeAt(i);
      checksum = checksum & checksum;
    }
    return Math.abs(checksum).toString(16);
  }

  static verifyChecksum(batch: BatchRequest, checksum: string): boolean {
    return this.calculateChecksum(batch) === checksum;
  }
}
