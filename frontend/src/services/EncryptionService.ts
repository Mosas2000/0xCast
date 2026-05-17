export interface EncryptedData {
  ciphertext: string;
  iv: string;
  salt: string;
}

export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly KEY_LENGTH = 256;
  private static readonly IV_LENGTH = 12;
  private static readonly SALT_LENGTH = 16;
  private static readonly ITERATIONS = 100000;

  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    const baseKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256',
      },
      baseKey,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH,
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private static async getEncryptionKey(): Promise<string> {
    if (typeof window === 'undefined') {
      throw new Error('Encryption only available in browser environment');
    }

    let key = sessionStorage.getItem('_ek');
    if (!key) {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      key = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem('_ek', key);
    }
    return key;
  }

  static async encrypt(data: string): Promise<EncryptedData> {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);

      const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

      const password = await this.getEncryptionKey();
      const key = await this.deriveKey(password, salt);

      const ciphertext = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv,
        },
        key,
        dataBuffer
      );

      return {
        ciphertext: this.arrayBufferToBase64(ciphertext),
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(salt),
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  static async decrypt(encryptedData: EncryptedData): Promise<string> {
    try {
      const ciphertext = this.base64ToArrayBuffer(encryptedData.ciphertext);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      const salt = this.base64ToArrayBuffer(encryptedData.salt);

      const password = await this.getEncryptionKey();
      const key = await this.deriveKey(password, new Uint8Array(salt));

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: new Uint8Array(iv),
        },
        key,
        ciphertext
      );

      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  static async encryptObject<T>(obj: T): Promise<EncryptedData> {
    const json = JSON.stringify(obj);
    return this.encrypt(json);
  }

  static async decryptObject<T>(encryptedData: EncryptedData): Promise<T> {
    const json = await this.decrypt(encryptedData);
    return JSON.parse(json);
  }

  private static arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private static base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  static isEncrypted(value: string): boolean {
    try {
      const parsed = JSON.parse(value);
      return (
        typeof parsed === 'object' &&
        parsed !== null &&
        'ciphertext' in parsed &&
        'iv' in parsed &&
        'salt' in parsed
      );
    } catch {
      return false;
    }
  }

  static clearEncryptionKey(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('_ek');
    }
  }
}
