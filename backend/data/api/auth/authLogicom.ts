// logicomApi.ts
import crypto from 'crypto';
import axios, { AxiosResponse } from 'axios';

// Configuration - contained within this file only
const LOGICOM_CREDENTIALS = {
    ConsumerKey: process.env.SANITY_STUDIO_LOGICOM_CONSUMER_KEY,
    ConsumerSecret: process.env.SANITY_STUDIO_LOGICOM_CONSUMER_SECRET,
    AccessTokenKey: process.env.SANITY_STUDIO_LOGICOM_ACCESS_TOKEN_KEY,
    CustomerID: process.env.SANITY_STUDIO_LOGICOM_CUSTOMER_ID,          
    baseUrl: process.env.LOGICOM_API_URL // Stagging URL
};

interface LogicomResponse {
  StatusCode: number;
  Status: string;
  Message: any;
  [key: string]: any;
}

export class LogicomAPI {
  private credentials: typeof LOGICOM_CREDENTIALS;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    this.credentials = LOGICOM_CREDENTIALS;
  }

  // Helper function for encryption
  private encryptLogicomData(text: string): string {
    const iv = Buffer.alloc(16, 0);
    const key = Buffer.from(this.credentials.AccessTokenKey, 'utf8');
    
    if (key.length !== 32) throw new Error('AccessTokenKey must be 32 bytes');
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return encrypted;
  }

  // Generate access token
  async generateAccessToken(): Promise<string> {
    const timestamp = Math.floor(Date.now() / 1000);
    
    const bCodeText = `${this.credentials.ConsumerKey};${this.credentials.ConsumerSecret}`;
    const BCode = this.encryptLogicomData(bCodeText);

    const signatureText = `${this.credentials.ConsumerKey}${this.credentials.CustomerID}${timestamp};${this.credentials.ConsumerSecret}`;
    const GenerateSignature = this.encryptLogicomData(signatureText);

    try {
      const response: AxiosResponse<string> = await axios.get(
        `${this.credentials.baseUrl}/GenerateAccessToken`, 
        {
          headers: {
            CustomerID: this.credentials.CustomerID,
            Timestamp: timestamp.toString(),
            BCode,
            GenerateSignature
          }
        }
      );

      this.accessToken = response.data;
      this.tokenExpiry = Date.now() + 60000;
      console.log('Access Token generated successfully');
      return this.accessToken;
    } catch (error) {
      console.error('Error generating access token:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  // Get headers for API requests
  async getRequestHeaders(): Promise<{
    Authorization: string;
    Timestamp: string;
    Signature: string;
    CustomerID: string;
  }> {
    if (!this.accessToken || Date.now() >= (this.tokenExpiry || 0)) {
      await this.generateAccessToken();
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signatureText = `${this.accessToken}${timestamp}`;
    const encryptedSignature = this.encryptLogicomData(signatureText);
    const doubleEncodedSignature = Buffer.from(encryptedSignature).toString('base64');

    return {
      Authorization: this.accessToken as string,
      Timestamp: timestamp.toString(),
      Signature: doubleEncodedSignature,
      CustomerID: this.credentials.CustomerID
    };
  }

  // Make API request
  async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<LogicomResponse> {
    try {
      const headers = await this.getRequestHeaders();
      const response: AxiosResponse<LogicomResponse> = await axios.get(
        `${this.credentials.baseUrl}/${endpoint}`, 
        { headers, params }
      );
      return response.data;
    } catch (error) {
      console.error(
        `API request to ${endpoint} failed:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }
}

// Export a pre-configured instance
export const logicomApi = new LogicomAPI();