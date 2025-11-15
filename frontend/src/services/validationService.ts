export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class ValidationService {
  static validateField(value: any, rules: ValidationRule): ValidationResult {
    const errors: string[] = [];

    if (rules.required && (value === null || value === undefined || value === '')) {
      errors.push('This field is required');
      return { isValid: false, errors };
    }

    if (value !== null && value !== undefined && value !== '') {
      if (rules.minLength && value.toString().length < rules.minLength) {
        errors.push(`Minimum length is ${rules.minLength} characters`);
      }

      if (rules.maxLength && value.toString().length > rules.maxLength) {
        errors.push(`Maximum length is ${rules.maxLength} characters`);
      }

      if (rules.pattern && !rules.pattern.test(value.toString())) {
        errors.push('Invalid format');
      }

      if (rules.min !== undefined && Number(value) < rules.min) {
        errors.push(`Minimum value is ${rules.min}`);
      }

      if (rules.max !== undefined && Number(value) > rules.max) {
        errors.push(`Maximum value is ${rules.max}`);
      }

      if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) {
          errors.push(customError);
        }
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateForm(data: Record<string, any>, schema: Record<string, ValidationRule>): ValidationResult {
    const allErrors: string[] = [];

    for (const [field, rules] of Object.entries(schema)) {
      const fieldResult = this.validateField(data[field], rules);
      if (!fieldResult.isValid) {
        allErrors.push(...fieldResult.errors.map(error => `${field}: ${error}`));
      }
    }

    return { isValid: allErrors.length === 0, errors: allErrors };
  }

  // Common validation patterns
  static patterns = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^[+]?[\d\s\-()]{10,}$/,
    amount: /^\d+(\.\d{1,2})?$/,
    alphanumeric: /^[a-zA-Z0-9]+$/,
    strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  };

  // Common validation rules
  static rules = {
    email: { required: true, pattern: this.patterns.email },
    phone: { required: true, pattern: this.patterns.phone },
    amount: { 
      required: true, 
      pattern: this.patterns.amount,
      min: 0.01,
      max: 100000,
      custom: (value: number) => {
        if (value <= 0) return 'Amount must be greater than 0';
        if (value > 100000) return 'Amount cannot exceed ₹1,00,000';
        return null;
      }
    },
    password: { 
      required: true, 
      minLength: 8,
      pattern: this.patterns.strongPassword,
      custom: (value: string) => {
        if (!this.patterns.strongPassword.test(value)) {
          return 'Password must contain uppercase, lowercase, number and special character';
        }
        return null;
      }
    }
  };
}