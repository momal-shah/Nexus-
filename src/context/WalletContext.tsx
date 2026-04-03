// src/context/WalletContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'transfer';
  status: 'Completed' | 'Pending';
}

interface WalletContextType {
  balance: number;
  transactions: Transaction[];
  addTransaction: (type: 'deposit' | 'withdrawal' | 'transfer', amount: number, desc: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [balance, setBalance] = useState(25000.00); // Initial mock balance
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 1, date: '2026-03-10', description: 'Initial Seed Funding', amount: 25000, type: 'deposit', status: 'Completed' },
    { id: 2, date: '2026-03-12', description: 'Server Costs', amount: -150, type: 'withdrawal', status: 'Completed' },
  ]);

  const addTransaction = (type: 'deposit' | 'withdrawal' | 'transfer', amount: number, description: string) => {
    const newTransaction: Transaction = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      description,
      amount: type === 'deposit' ? amount : -amount,
      type,
      status: 'Completed'
    };

    setTransactions([newTransaction, ...transactions]);
    
    if (type === 'deposit') setBalance(prev => prev + amount);
    else setBalance(prev => prev - amount);
  };

  return (
    <WalletContext.Provider value={{ balance, transactions, addTransaction }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};