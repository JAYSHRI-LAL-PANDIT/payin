import { Controller, Get, Res } from '@nestjs/common';
import { PayinService } from './payin.service';
import { Response } from 'express';

@Controller('')
export class PayinController {
  constructor(private readonly payinService: PayinService) {}

  @Get('')
  async root(@Res() res: Response): Promise<void> {
    
    const payload = {
      KEY: this.payinService.key,
      UID: this.payinService.uid,
      AMOUNT: '10.00',
      ORDER_ID: this.payinService.generateRandomOrderId(20),
      CURRENCY: '356',
      PAYMENT_CATEGORY_CODE: 'UP',
      MODE_OF_PAYMENT: 'IN',
      TRANSACTION_TYPE: 'SALE',
      CUSTOMER_NAME: 'Charles',
      CUSTOMER_ADDRESS: 'India',
      CUSTOMER_EMAIL: 'rral23@gmail.com',
      CUSTOMER_MOBILE: '9988992332',
    };

    const sign = this.payinService.generateSign(payload, this.payinService.key);
    console.log('----------------------------------------------------------------------------');
    console.log('Signature: ' + sign);
    console.log('----------------------------------------------------------------------------');
    payload['SIGN'] = sign;

    console.log('Payload without encryption: ', payload);
    console.log('----------------------------------------------------------------------------');

    const encryptedData = this.payinService.encrypt(JSON.stringify(payload), this.payinService.encryptionKey);
    console.log('Payload post encryption: ' + encryptedData);
    console.log('\n\n#############################################################################');

    const finalSeamlessPayload = {
      UID: payload.UID,
      SECURE_DATA: encryptedData,
    };
    console.log('Final data to be posted: ', finalSeamlessPayload);
    console.log('#############################################################################\n\n');

    console.log('Decrypted payload: ' + this.payinService.decrypt(finalSeamlessPayload.SECURE_DATA, this.payinService.encryptionKey));
    console.log('----------------------------------------------------------------------------');

    const apiResponse = await this.payinService.sendRequest(finalSeamlessPayload);

    if (apiResponse && apiResponse.data && apiResponse.data.UPI_INTENT) {
      const upiIntent = apiResponse.data.UPI_INTENT;
      const qrCodeImage = await this.payinService.generateQRCode(upiIntent);
      res.send(`<h1>UPI Payment QR Code</h1><img src="${qrCodeImage}" alt="QR Code">`);
    } else {
      res.send('Failed to generate QR Code');
    }
  }
}
