// This is a placeholder for the Resend email system
// You can later implement this using the 'resend' npm package

export interface OrderConfirmationEmailProps {
  to: string;
  customerName: string;
  orderTitle: string;
  planName: string;
  price: number;
  orderId: string;
  invoiceUrl?: string;
}

import { Resend } from 'resend';

export const sendOrderConfirmationEmail = async (props: OrderConfirmationEmailProps) => {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log(`[MOCK EMAIL] To: ${props.to} | Subject: Order Confirmation for ${props.orderTitle}`);
    console.log(`[MOCK EMAIL BODY] Hello ${props.customerName}, your order has been received!`);
    return { success: true, mocked: true };
  }

  try {
    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: 'Tyes Studio <hello@tyes.app>',
      to: props.to,
      subject: `Order Confirmation - ${props.orderTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h1 style="color: #4ecdc4;">Order Confirmation</h1>
          <p>Hi ${props.customerName},</p>
          <p>Thank you for your order! We have received your request for the <strong>${props.planName}</strong> plan.</p>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0;"><strong>Order:</strong> ${props.orderTitle}</p>
            <p style="margin: 0 0 10px 0;"><strong>Plan:</strong> ${props.planName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Price:</strong> $${props.price}</p>
            ${props.invoiceUrl ? `<p style="margin: 0;"><strong>Invoice:</strong> <a href="${props.invoiceUrl}" style="color: #4ecdc4; text-decoration: none;">Download Invoice</a></p>` : ''}
          </div>
          
          <p>We are already processing your request and will notify you as soon as there are updates.</p>
          <p>Best regards,<br>Tyes Studio Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error sending email:', err);
    return { success: false, error: err };
  }
};
