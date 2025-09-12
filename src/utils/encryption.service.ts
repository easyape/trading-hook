import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly encryptionSeed: string;

  constructor(private configService: ConfigService) {
    const seed = this.configService.get<string>('ENCRYPTION_SEED') || 'default-encryption-seed-for-development';
    this.encryptionSeed = seed;
  }

  /**
   * Encrypts sensitive data using AES-256-CBC
   * @param data Data to encrypt
   * @param userId User ID to use as part of the encryption key
   * @returns Encrypted data as a string
   */
  encrypt(data: string, userId: string): string {
    try {
      // Create a unique key for this user using the userId and the seed
      const key = this.generateKey(userId);
      
      // Generate a random initialization vector
      const iv = crypto.randomBytes(16);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      
      // Encrypt the data
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Return the IV and encrypted data as a single string
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypts encrypted data
   * @param encryptedData Encrypted data string (IV:encryptedData format)
   * @param userId User ID used for encryption
   * @returns Decrypted data as a string
   */
  decrypt(encryptedData: string, userId: string): string {
    try {
      // Split the IV and encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      // Create a unique key for this user using the userId and the seed
      const key = this.generateKey(userId);
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      
      // Decrypt the data
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generates a cryptographic key from the user ID and encryption seed
   * @param userId User ID to use in key generation
   * @returns 32-byte key for AES-256
   */
  private generateKey(userId: string): Buffer {
    // Combine the userId and seed to create a unique key for each user
    const combinedKey = `${userId}:${this.encryptionSeed}`;
    
    // Use SHA-256 to generate a 32-byte key (required for AES-256)
    return crypto.createHash('sha256').update(combinedKey).digest();
  }
}
