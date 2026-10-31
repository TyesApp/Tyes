import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Name, email, subject, and message are required.' },
        { status: 400 }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error("Resend API key missing");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const resend = new Resend(resendApiKey);

    const { data, error } = await resend.emails.send({
      from: 'Tyes Contact Form <office@tyes.app>',
      to: 'office@tyes.app',
      replyTo: email,
      subject: `New Contact Form Submission: ${String(subject || 'No Subject').slice(0, 150)}`,
      html: `
        <h2>New message from ${esc(name)}</h2>
        <p><strong>Email:</strong> ${esc(email)}</p>
        <p><strong>Subject:</strong> ${esc(subject)}</p>
        <hr />
        <p>${esc(message).replace(/\n/g, '<br />')}</p>
      `,
    });

    if (error) {
      console.error("Resend Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Contact Form Error:", error);
    return NextResponse.json(
      { error: 'Failed to process request.' },
      { status: 500 }
    );
  }
}
