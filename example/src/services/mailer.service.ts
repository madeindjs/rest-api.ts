// src/services/mailer.service.ts
import {inject, injectable} from 'inversify';
import {
  createTestAccount,
  createTransport,
  SendMailOptions,
  Transporter,
} from 'nodemailer';
import {TYPES} from '../core/types.core';
import {Order} from '../entities/order.entity';
import {Logger} from './logger.service';

@injectable()
export class MailerService {
  private static transporter: Transporter;

  public constructor(@inject(TYPES.Logger) private readonly logger: Logger) {}

  public async sendEmail(options: SendMailOptions): Promise<void> {
    await this.initializeTransporter();

    await MailerService.transporter.sendMail(options);
    this.logger.log('INFO', `[MailerService] Send email to ${options.to}`);
  }

  public async sendNewOrderEmail(order: Order): Promise<void> {
    const productText = order.placements.map(p => `- ${p.product.title}`);
    const text = `Details of products:\n${productText}\nTOTAL:${order.total}€`;

    await this.sendEmail({
      to: order.user.email,
      text,
      subject: 'Thanks for order',
    });
  }

  protected async initializeTransporter() {
    if (MailerService.transporter !== undefined) {
      return;
    }

    let {user, pass} = await createTestAccount();

    MailerService.transporter = createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {user, pass},
    });
  }
}
