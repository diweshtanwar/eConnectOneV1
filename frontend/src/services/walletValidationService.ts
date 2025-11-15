import { walletApi } from '../api/api';

export interface WalletValidationResult {
  canProcess: boolean;
  hasNegativeBalance: boolean;
  currentBalance: number;
  newBalance: number;
  message: string;
}

class WalletValidationService {
  async validateWithdrawal(userId: number, amount: number): Promise<WalletValidationResult> {
    try {
      const wallet = await walletApi.getWallet();
      const newBalance = wallet.balance - amount;
      
      if (newBalance >= 0) {
        return {
          canProcess: true,
          hasNegativeBalance: false,
          currentBalance: wallet.balance,
          newBalance,
          message: 'Withdrawal processed successfully'
        };
      } else {
        return {
          canProcess: true,
          hasNegativeBalance: true,
          currentBalance: wallet.balance,
          newBalance,
          message: `⚠️ Negative Balance: Current ₹${wallet.balance.toLocaleString()} - Withdrawal ₹${amount.toLocaleString()} = New Balance ₹${newBalance.toLocaleString()}`
        };
      }
    } catch (error) {
      return {
        canProcess: false,
        hasNegativeBalance: false,
        currentBalance: 0,
        newBalance: 0,
        message: 'Error validating wallet balance'
      };
    }
  }

  async processDeposit(userId: number, amount: number): Promise<WalletValidationResult> {
    try {
      const wallet = await walletApi.getWallet();
      const newBalance = wallet.balance + amount;
      
      return {
        canProcess: true,
        hasNegativeBalance: false,
        currentBalance: wallet.balance,
        newBalance,
        message: 'Deposit processed successfully'
      };
    } catch (error) {
      return {
        canProcess: false,
        hasNegativeBalance: false,
        currentBalance: 0,
        newBalance: 0,
        message: 'Error processing deposit'
      };
    }
  }
}

export const walletValidationService = new WalletValidationService();