import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Email Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'brightstore01.info@gmail.com',
        pass: 'oevj exqt ttjf bwgr', // App Password
    },
});

export async function POST(request: Request) {
    console.log('Checkout API called');
    try {
        const body = await request.json();
        const { items, total, user, profile } = body;
        const authHeader = request.headers.get('Authorization');

        console.log('Received body:', { total, itemCount: items?.length, userId: user?.id });

        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: {
                headers: {
                    Authorization: authHeader || '',
                },
            },
        });

        if (!user || !profile) {
            console.error('Missing user or profile');
            return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
        }

        // 1. Save Order to Supabase
        console.log('Saving order to Supabase...');
        const { data: order, error: dbError } = await supabase
            .from('orders')
            .insert({
                user_id: user.id,
                total_amount: total,
                items: items,
                shipping_address: {
                    full_name: profile.full_name,
                    phone: profile.phone,
                    address_line1: profile.address_line1,
                    address_line2: profile.address_line2,
                    city: profile.city,
                    pincode: profile.pincode,
                },
                status: 'pending'
            })
            .select()
            .single();

        if (dbError) {
            console.error('Database Error:', dbError);
            return NextResponse.json({ error: 'Failed to save order' }, { status: 500 });
        }
        console.log('Order saved:', order.id);

        // 2. Generate Email Content
        const orderId = order.id.slice(0, 8).toUpperCase();
        const date = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        const itemsHtml = items.map((item: any) => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.quantity} kg</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${item.price}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">₹${item.price * item.quantity}</td>
            </tr>
        `).join('');

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <div style="background-color: #000; color: #EAB308; padding: 20px; text-align: center;">
                    <h1>Bright Store</h1>
                    <p>Premium Quality, Unbeatable Prices</p>
                </div>
                
                <div style="padding: 20px; border: 1px solid #ddd;">
                    <h2>Order Confirmation</h2>
                    <p>Dear ${profile.full_name},</p>
                    <p>Thank you for your order! We have received your request and will process it shortly.</p>
                    
                    <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0;">
                        <p><strong>Order ID:</strong> #${orderId}</p>
                        <p><strong>Date:</strong> ${date}</p>
                        <p><strong>Status:</strong> Pending</p>
                    </div>

                    <h3>Order Details</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f1f1f1;">
                                <th style="padding: 8px; text-align: left;">Item</th>
                                <th style="padding: 8px; text-align: left;">Qty</th>
                                <th style="padding: 8px; text-align: left;">Price</th>
                                <th style="padding: 8px; text-align: left;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total Amount:</td>
                                <td style="padding: 8px; font-weight: bold;">₹${total}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="margin-top: 20px;">
                        <h3>Shipping Address</h3>
                        <p>
                            ${profile.full_name}<br>
                            ${profile.address_line1}, ${profile.address_line2}<br>
                            ${profile.city} - ${profile.pincode}<br>
                            Phone: ${profile.phone}
                        </p>
                    </div>
                </div>

                <div style="text-align: center; padding: 20px; font-size: 12px; color: #666;">
                    <p>If you have any questions, please contact us at brightstore01.info@gmail.com</p>
                    <p>&copy; ${new Date().getFullYear()} Bright Store. All rights reserved.</p>
                </div>
            </div>
        `;

        // 3. Send Email to Owner and Customer

        // Let's try to get the email from the 'profile' object first, or the 'user' object from body.
        let userEmail = profile.email || user.email;

        // If not found, try to fetch from DB profiles table
        if (!userEmail) {
            const { data: dbProfile } = await supabase
                .from('profiles')
                .select('email')
                .eq('id', user.id)
                .single();
            if (dbProfile) userEmail = dbProfile.email;
        }

        // If still not found, try to get from Auth User (since we have the token)
        if (!userEmail) {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) userEmail = authUser.email;
        }

        const logoPath = path.join(process.cwd(), 'public', 'logo.png');
        console.log('Logo path:', logoPath);

        const attachments = [];
        if (fs.existsSync(logoPath)) {
            attachments.push({
                filename: 'logo.png',
                path: logoPath,
                cid: 'logo'
            });
        } else {
            console.warn('Logo file not found at:', logoPath);
        }

        const mailOptions = {
            from: '"Bright Store" <brightstore01.info@gmail.com>',
            to: 'brightstore01.info@gmail.com', // Always send to owner
            subject: `New Order #${orderId} from ${profile.full_name}`,
            html: emailHtml.replace(
                '<h1>Bright Store</h1>',
                '<img src="cid:logo" alt="Bright Store" style="max-width: 150px; margin-bottom: 10px;" />'
            ),
            attachments: attachments
        };

        // Send to Owner
        console.log('Sending email to owner...');
        await transporter.sendMail(mailOptions);
        console.log('Email sent to owner');

        // Send to Customer if email exists
        if (userEmail) {
            console.log('Sending email to customer:', userEmail);
            await transporter.sendMail({
                ...mailOptions,
                to: userEmail,
                subject: `Order Confirmation #${orderId} - Bright Store`,
                html: emailHtml.replace('New Order Received', 'Order Confirmation'), // Slight adjustment if needed
            });
            console.log(`Email sent to customer: ${userEmail}`);
        } else {
            console.log('No customer email found, skipping customer email.');
        }

        return NextResponse.json({ success: true, orderId });

    } catch (error: any) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
