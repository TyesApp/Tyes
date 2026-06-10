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

export const sendOrderConfirmationEmail = async (props: OrderConfirmationEmailProps) => {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.log(`[MOCK EMAIL] To: ${props.to} | Subject: Order Confirmation for ${props.orderTitle}`);
    console.log(`[MOCK EMAIL BODY] Hello ${props.customerName}, your order has been received!`);
    return { success: true, mocked: true };
  }

  // TODO: Implement actual Resend logic here
  // Example:
  // const resend = new Resend(resendApiKey);
  // await resend.emails.send({
  //   from: 'Tyes Studio <hello@tyes.studio>',
  //   to: props.to,
  //   subject: `Order Confirmation - ${props.orderTitle}`,
  //   html: `<p>Hi ${props.customerName}, thanks for your order!</p>...`
  // });

  return { success: true };
};
