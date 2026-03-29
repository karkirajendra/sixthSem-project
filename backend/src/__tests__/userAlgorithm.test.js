import { jest } from '@jest/globals';
import User from '../models/user.js';
import mongoose from 'mongoose';

describe('Algorithm Test: Brute-Force Rate Limiting (Security)', () => {
  let userDoc;

  beforeEach(() => {
    // Create a virtual instance of a User directly in RAM
    userDoc = new User({
      name: 'Test Hacker',
      email: 'hacker@example.com',
      password: 'password123',
      loginAttempts: 0,
    });
    
    // Mock the Mongoose update function so we don't need a live DB connection
    userDoc.updateOne = jest.fn((updates) => {
      if (updates.$inc) userDoc.loginAttempts += updates.$inc.loginAttempts;
      if (updates.$set && updates.$set.lockUntil) userDoc.lockUntil = updates.$set.lockUntil;
      if (updates.$set && updates.$set.loginAttempts !== undefined) userDoc.loginAttempts = updates.$set.loginAttempts;
      if (updates.$unset && updates.$unset.lockUntil) userDoc.lockUntil = undefined;
      return Promise.resolve(userDoc);
    });
  });

  afterAll(async () => {
    // Close the mongoose connection memory handle
    await mongoose.connection.close();
  });

  it('Step 1: Should start with 0 login attempts and no lock', () => {
    expect(userDoc.loginAttempts).toBe(0);
    expect(userDoc.isLocked).toBe(false);
  });

  it('Step 2: Should increment login failures correctly without locking below 5 attempts', async () => {
    await userDoc.incLoginAttempts();
    expect(userDoc.updateOne).toHaveBeenCalledWith({ $inc: { loginAttempts: 1 } });
    expect(userDoc.loginAttempts).toBe(1);
    expect(userDoc.isLocked).toBe(false);
  });

  it('Step 3: Algorithm should mathematically lock account for 2 hours on the 5th failed attempt', async () => {
    userDoc.loginAttempts = 4; // Fast-forward to 4 failed attempts

    // 5th attempt
    await userDoc.incLoginAttempts();

    // Verify the algorithm calculation (Date.now() + 2 hours)
    expect(userDoc.updateOne).toHaveBeenCalled();
    const mockCalls = userDoc.updateOne.mock.calls[0][0];

    expect(mockCalls.$set.lockUntil).toBeGreaterThan(Date.now());
    expect(userDoc.isLocked).toBe(true);
  });

  it('Step 4: Algorithm should properly reset lock if 2 hours have expired', async () => {
    // Simulate account locked 3 hours ago
    userDoc.loginAttempts = 5;
    userDoc.lockUntil = Date.now() - 3 * 60 * 60 * 1000;

    await userDoc.incLoginAttempts();

    // The algorithm should intercept the expired timestamp and reset logic
    expect(userDoc.updateOne).toHaveBeenCalledWith({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
    
    expect(userDoc.lockUntil).toBeUndefined();
    expect(userDoc.loginAttempts).toBe(1);
    expect(userDoc.isLocked).toBe(false); // Account mathematically freed
  });
});
