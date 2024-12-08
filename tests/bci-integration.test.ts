import { describe, it, expect, beforeEach } from 'vitest';

// Mock for the BCI devices and collected data storage
let bciDevices: Map<number, {
  owner: string,
  name: string,
  status: string
}> = new Map();
let collectedData: Map<string, {
  dataHash: string,
  processed: boolean
}> = new Map();
let nextDeviceId = 1;

// Helper function to simulate contract calls
const simulateContractCall = (functionName: string, args: any[], sender: string) => {
  if (functionName === 'register-device') {
    const [name] = args;
    const deviceId = nextDeviceId++;
    bciDevices.set(deviceId, { owner: sender, name, status: 'active' });
    return { success: true, value: deviceId };
  }
  if (functionName === 'submit-data') {
    const [deviceId, dataHash] = args;
    const device = bciDevices.get(deviceId);
    if (!device || device.owner !== sender) {
      return { success: false, error: 'Not authorized or device not found' };
    }
    const dataKey = `${deviceId}-${Date.now()}`;
    collectedData.set(dataKey, { dataHash, processed: false });
    return { success: true };
  }
  if (functionName === 'process-data') {
    const [deviceId, timestamp] = args;
    const dataKey = `${deviceId}-${timestamp}`;
    const data = collectedData.get(dataKey);
    if (data) {
      data.processed = true;
      collectedData.set(dataKey, data);
      return { success: true };
    }
    return { success: false, error: 'Data not found' };
  }
  if (functionName === 'get-device') {
    const [deviceId] = args;
    return bciDevices.get(deviceId) || null;
  }
  if (functionName === 'get-collected-data') {
    const [deviceId, timestamp] = args;
    const dataKey = `${deviceId}-${timestamp}`;
    return collectedData.get(dataKey) || null;
  }
  return { success: false, error: 'Function not found' };
};

describe('BCI Integration Contract', () => {
  const wallet1 = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
  const wallet2 = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';
  
  beforeEach(() => {
    bciDevices.clear();
    collectedData.clear();
    nextDeviceId = 1;
  });
  
  it('should register a device', () => {
    const result = simulateContractCall('register-device', ['NeuraLink X1'], wallet1);
    expect(result.success).toBe(true);
    expect(result.value).toBe(1);
  });
  
  it('should submit data for a registered device', () => {
    simulateContractCall('register-device', ['BrainWave Pro'], wallet1);
    const submitResult = simulateContractCall('submit-data', [1, '0x0123456789abcdef'], wallet1);
    expect(submitResult.success).toBe(true);
  });
  
  it('should process submitted data', () => {
    simulateContractCall('register-device', ['CogniTech 3000'], wallet1);
    simulateContractCall('submit-data', [1, '0x0123456789abcdef'], wallet1);
    const timestamp = Date.now();
    const processResult = simulateContractCall('process-data', [1, timestamp], wallet1);
    expect(processResult.success).toBe(true);
  });
  
  it('should retrieve device information', () => {
    simulateContractCall('register-device', ['MindMeld 5G'], wallet1);
    const result = simulateContractCall('get-device', [1], wallet2);
    expect(result).toBeDefined();
    expect(result?.name).toBe('MindMeld 5G');
  });
  
  it('should retrieve collected data', () => {
    simulateContractCall('register-device', ['SynapseSync'], wallet1);
    simulateContractCall('submit-data', [1, '0x0123456789abcdef'], wallet1);
    const timestamp = Date.now();
    const result = simulateContractCall('get-collected-data', [1, timestamp], wallet1);
    expect(result).toBeDefined();
    expect(result?.dataHash).toBe('0x0123456789abcdef');
  });
  
  it('should not allow unauthorized data submission', () => {
    simulateContractCall('register-device', ['SecureBrain 2000'], wallet1);
    const submitResult = simulateContractCall('submit-data', [1, '0x0123456789abcdef'], wallet2);
    expect(submitResult.success).toBe(false);
  });
});

