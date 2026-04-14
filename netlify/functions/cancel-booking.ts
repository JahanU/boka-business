/**
 * BACKEND FUNCTION: Cancel Booking Email
 * 
 * ROLE: Sends a cancellation email to the customer.
 */
import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Email address for sending emails
        pass: process.env.GMAIL_APP_PASSWORD, // App-specific password for authentication
    },
});

export const handler: Handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { customerEmail, customerName, serviceName, appointmentDate } = JSON.parse(event.body || '{}');

        // Send cancellation email via Nodemailer
        if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD && customerEmail) {
            try {
                await transporter.sendMail({
                    from: `"Ali Barbers" <${process.env.GMAIL_USER}>`,
                    to: customerEmail,
                    subject: 'Appointment Cancelled - Ali Barbers',
                    html: `
                        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h1 style="color: #dc2626;">Appointment Cancelled</h1>
                            <p>Hi ${customerName || 'Customer'},</p>
                            <p>We are writing to inform you that your appointment at Ali Barbers has been cancelled.</p>
                            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626;">
                                <p><strong>Service:</strong> ${serviceName || 'N/A'}</p>
                                <p><strong>Date:</strong> ${appointmentDate || 'N/A'}</p>
                            </div>
                            <p>If you have any questions or would like to reschedule, please visit our website to find our contact information.</p>
                            <p>Sorry for any inconvenience caused.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 12px; color: #666;">This is an automated notification from your barber.</p>
                        </div>
                    `
                });
            } catch (emailError) {
                console.error('Failed to send cancellation email:', emailError);
                return {
                    statusCode: 500,
                    body: JSON.stringify({ error: 'Failed to send email' })
                };
            }
        } else {
             console.log('Skipping email. Missing credentials or customerEmail');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Cancellation email sent successfully (if configured and customer email provided)' }),
        };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Cancellation Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Cancellation Failure',
                message: errorMessage,
            }),
        };
    }
};
