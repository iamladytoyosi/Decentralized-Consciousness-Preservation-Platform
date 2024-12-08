import { describe, it, expect, beforeEach } from 'vitest';

// Mock for the token balances
let tokenBalances: Map<string, number> = new Map();
let totalSupply = 0;

// Helper function to simulate contract calls
const simulateContractCall = (functionName: string, args: any[], sender: string) => {
  if (functionName === 'mint') {
    const [amount, recipient] = args;
    if (sender !== 'contract-owner') return { success: false, error: 'Not authorized' };
    tokenBalances.set(recipient, (tokenBalances.get(recipient) || 0) + amount);
    totalSupply += amount;
    return { success: true };
  }
  if (functionName === 'transfer') {
    const [amount, from, to] = args;
    if (sender !== from) return { success: false, error: 'Not authorized' };
    const fromBalance = tokenBalances.get(from) || 0;
    if (fromBalance < amount) return { success: false, error: 'Insufficient balance' };
    tokenBalances.set(from, fromBalance - amount);
    tokenBalances.set(to, (tokenBalances.get(to) || 0) + amount);
    return { success: true };
  }
  if (functionName === 'get-balance') {
    const [account] = args;
    return { success: true, value: tokenBalances.get(account) || 0 };
  }
  if (functionName === 'get-total-supply') {
    return { success: true, value: totalSupply };
  }
  return { success: false, error: 'Function not found' };
};

describe('Consciousness Token Contract', () => {
  const wallet1 = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const wallet2 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  
  beforeEach(() => {
    tokenBalances.clear();
    totalSupply = 0;
  });
  
  it('should mint tokens', () => {
    const result = simulateContractCall('mint', [1000, wallet1], 'contract-owner');
    expect(result.success).toBe(true);
    const balanceResult = simulateContractCall('get-balance', [wallet1], wallet1);
    expect(balanceResult.value).toBe(1000);
  });
  
  it('should transfer tokens', () => {
    simulateContractCall('mint', [1000, wallet1], 'contract-owner');
    const transferResult = simulateContractCall('transfer', [500, wallet1, wallet2], wallet1);
    expect(transferResult.success).toBe(true);
    const balance1Result = simulateContractCall('get-balance', [wallet1], wallet1);
    const balance2Result = simulateContractCall('get-balance', [wallet2], wallet2);
    expect(balance1Result.value).toBe(500);
    expect(balance2Result.value).toBe(500);
  });
  
  it('should not allow unauthorized minting', () => {
    const result = simulateContractCall('mint', [1000, wallet1], wallet1);
    expect(result.success).toBe(false);
  });
  
  it('should return correct total supply', () => {
    simulateContractCall('mint', [1000, wallet1], 'contract-owner');
    simulateContractCall('mint', [500, wallet2], 'contract-owner');
    const supplyResult = simulateContractCall('get-total-supply', [], wallet1);
    expect(supplyResult.value).toBe(1500);
  });
});

