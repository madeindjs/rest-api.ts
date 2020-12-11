// src/tests/fakeMailer.service.ts
import { injectable } from "inversify";
import { SendMailOptions } from "nodemailer";
import { MailerService } from "../services/mailer.service";

@injectable()
export class FakeMailerService extends MailerService {
  public async sendEmail(options: SendMailOptions): Promise<void> {}
  protected async initializeTransporter() {}
}
