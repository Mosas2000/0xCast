export interface PIIField {
  type: 'email' | 'phone' | 'address' | 'name' | 'ssn' | 'creditCard' | 'ipAddress' | 'walletAddress' | 'custom';
  field: string;
  value: any;
  sensitive: boolean;
}

export interface PIIDetectionResult {
  hasPII: boolean;
  fields: PIIField[];
  requiresConsent: boolean;
}

export class PIIDetectionService {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private static readonly PHONE_REGEX = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  private static readonly SSN_REGEX = /^\d{3}-?\d{2}-?\d{4}$/;
  private static readonly CREDIT_CARD_REGEX = /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/;
  private static readonly IP_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  private static readonly WALLET_ADDRESS_REGEX = /^(SP|SM)[0-9A-Z]{39}$/;

  private static readonly PII_FIELD_NAMES = [
    'email', 'phone', 'address', 'name', 'firstName', 'lastName',
    'ssn', 'socialSecurity', 'creditCard', 'cardNumber',
    'ipAddress', 'walletAddress', 'userId', 'username'
  ];

  static detectPII(data: Record<string, any>): PIIDetectionResult {
    const fields: PIIField[] = [];

    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) continue;

      const piiField = this.detectFieldPII(key, value);
      if (piiField) {
        fields.push(piiField);
      }
    }

    return {
      hasPII: fields.length > 0,
      fields,
      requiresConsent: fields.some(f => f.sensitive),
    };
  }

  private static detectFieldPII(field: string, value: any): PIIField | null {
    const fieldLower = field.toLowerCase();
    const valueStr = String(value);

    if (this.EMAIL_REGEX.test(valueStr)) {
      return { type: 'email', field, value, sensitive: true };
    }

    if (this.PHONE_REGEX.test(valueStr)) {
      return { type: 'phone', field, value, sensitive: true };
    }

    if (this.SSN_REGEX.test(valueStr)) {
      return { type: 'ssn', field, value, sensitive: true };
    }

    if (this.CREDIT_CARD_REGEX.test(valueStr)) {
      return { type: 'creditCard', field, value, sensitive: true };
    }

    if (this.IP_REGEX.test(valueStr)) {
      return { type: 'ipAddress', field, value, sensitive: false };
    }

    if (this.WALLET_ADDRESS_REGEX.test(valueStr)) {
      return { type: 'walletAddress', field, value, sensitive: false };
    }

    if (this.PII_FIELD_NAMES.some(name => fieldLower.includes(name))) {
      return { type: 'custom', field, value, sensitive: true };
    }

    return null;
  }

  static maskPII(value: string, type: PIIField['type']): string {
    switch (type) {
      case 'email':
        const [local, domain] = value.split('@');
        return `${local.substring(0, 2)}***@${domain}`;
      
      case 'phone':
        return value.replace(/\d(?=\d{4})/g, '*');
      
      case 'ssn':
        return `***-**-${value.slice(-4)}`;
      
      case 'creditCard':
        return `****-****-****-${value.slice(-4)}`;
      
      case 'ipAddress':
        const parts = value.split('.');
        return `${parts[0]}.${parts[1]}.*.*`;
      
      case 'walletAddress':
        return `${value.substring(0, 6)}...${value.substring(value.length - 4)}`;
      
      default:
        return value.substring(0, 3) + '***';
    }
  }

  static sanitizeData(data: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    const detection = this.detectPII(data);

    for (const [key, value] of Object.entries(data)) {
      const piiField = detection.fields.find(f => f.field === key);
      if (piiField && piiField.sensitive) {
        result[key] = this.maskPII(String(value), piiField.type);
      } else {
        result[key] = value;
      }
    }

    return result;
  }

  static validateConsent(data: Record<string, any>, hasConsent: boolean): boolean {
    const detection = this.detectPII(data);
    if (!detection.requiresConsent) {
      return true;
    }
    return hasConsent;
  }
}
