import { describe, it, expect, beforeEach } from 'vitest';

// Mock for the consciousness data storage
let consciousnessData: Map<string, { dataHash: string, timestamp: number, version: number }> = new Map();
let nextVersionNumber = 1;

// Helper function to simulate contract calls
const simulateContractCall = (functionName: string, args: any[], sender: string) => {
  if (functionName === 'store-consciousness') {
    const [dataHash] = args;
    const version = nextVersionNumber++;
    consciousnessData.set(sender, { dataHash, timestamp: Date.now(), version });
    return { success: true, value: version };
  }
  if (functionName === 'get-consciousness-data') {
    const [owner] = args;
    return consciousnessData.get(owner) || null;
  }
  if (functionName === 'delete-consciousness-data') {
    consciousnessData.delete(sender);
    return { success: true };
  }
  return { success: false, error: 'Function not found' };
};

describe('Consciousness Storage Contract', () => {
  const wallet1 = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const wallet2 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  
  beforeEach(() => {
    consciousnessData.clear();
    nextVersionNumber = 1;
  });
  
  it('should store consciousness data', () => {
    const result = simulateContractCall('store-consciousness', ['0x0123456789abcdef'], wallet1);
    expect(result.success).toBe(true);
    expect(result.value).toBe(1);
  });
  
  it('should retrieve consciousness data', () => {
    simulateContractCall('store-consciousness', ['0x0123456789abcdef'], wallet1);
    const result = simulateContractCall('get-consciousness-data', [wallet1], wallet1);
    expect(result).toBeDefined();
    expect(result?.dataHash).toBe('0x0123456789abcdef');
  });
  
  it('should delete consciousness data', () => {
    simulateContractCall('store-consciousness', ['0x0123456789abcdef'], wallet1);
    const deleteResult = simulateContractCall('delete-consciousness-data', [], wallet1);
    expect(deleteResult.success).toBe(true);
    const getResult = simulateContractCall('get-consciousness-data', [wallet1], wallet1);
    expect(getResult).toBeNull();
  });
  
  it('should increment version number for multiple stores', () => {
    const result1 = simulateContractCall('store-consciousness', ['0x0123456789abcdef'], wallet1);
    const result2 = simulateContractCall('store-consciousness', ['0x9876543210fedcba'], wallet1);
    expect(result1.value).toBe(1);
    expect(result2.value).toBe(2);
  });
});

