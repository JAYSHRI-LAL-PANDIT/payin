import { Injectable } from '@nestjs/common';
import { config } from 'dotenv';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import axios from 'axios';

config();

@Injectable()
export class PayinService {
  
  encryptionKey: string =process.env.encryptionKey;
  key: string = process.env.key;
  uid: string =process.env.uid;

  constructor() {}

  generateRandomOrderId(length: number): string {
    let CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = CHARACTERS.length;
    for (let i = 0; i < length; i++) {
      result += CHARACTERS.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  } 

  generateSign(payload: Record<string, any>, key: string): string {
    const signatureParameters = [
      "AMOUNT",
      "CARD_NUMBER",
      "CURRENCY",
      "CUSTOMER_ADDRESS",
      "CUSTOMER_EMAIL",
      "CUSTOMER_MOBILE",
      "CUSTOMER_NAME",
      "CVV",
      "EXPIRY_DATE",
      "MODE_OF_PAYMENT",
      "ORDER_ID",
      "PAYMENT_CATEGORY_CODE",
      "PG_TXN_ID",
      "REFUND_ORDER_ID",
      "RETURN_URL",
      "TRANSACTION_TYPE",
      "UID",
      "UPI_INTENT",
      "VPA",
    ];

    let signString = "";
    signatureParameters.forEach((param) => {
      if (payload[param]) {
        signString += payload[param] + "|";
      }
    });

    signString += key;

    return this.toHexString(this.getSHA(signString));
  }

  getSHA(text: string): Buffer {
      return crypto.createHash('sha256').update(text, 'utf8').digest();
  }

  toHexString(buffer: Buffer): string {
      return buffer.toString('hex').padStart(64, '0');
  }
  
  encrypt(textToEncrypt: string, secretKey: string): string {
    try {
      const iv = Buffer.alloc(16, 0); 
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'utf-8'), iv);
  
      let encrypted = cipher.update(textToEncrypt, 'utf-8', 'base64');
      encrypted += cipher.final('base64');
  
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error.message);
      throw new Error('Encryption failed');
    }
  }

  decrypt(encryptedText: string, secretKey: string): string {
    const iv = Buffer.alloc(16, 0); 
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'utf-8'), iv);
    
    let decrypted = decipher.update(encryptedText, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
  }

  async sendRequest(data: Record<string, any>): Promise<any> {
    try {
      const url = "https://www.xpressplay.co/order/seamless/pay";
      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('API Response:', response.data);
      return response;
    } catch (error) {
      console.error('API Error:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  async generateQRCode(data: string): Promise<string> {
    try {
      const qrCodeBuffer = await QRCode.toBuffer(data);
      const qrCodeDataURL = `data:image/png;base64,${qrCodeBuffer.toString('base64')}`;
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR Code:', error.message);
      throw error;
    }
  }
}
