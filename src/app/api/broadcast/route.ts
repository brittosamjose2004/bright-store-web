import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'brightstore01.info@gmail.com',
        pass: 'oevj exqt ttjf bwgr',
    },
});

export async function POST(request: Request) {
    try {
        const { subject, body } = await request.json();
        const authHeader = request.headers.get('Authorization');

        // Verify Admin via Supabase
        const supabase = createClient(supabaseUrl, supabaseKey, {
            global: { headers: { Authorization: authHeader || '' } },
        });

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch all user profiles with emails and push tokens
        const { data: profiles, error: dbError } = await supabase
            .from('profiles')
            .select('email, push_token');

        if (dbError) throw dbError;

        let sentCount = 0;
        const pushTokens: string[] = [];
        const emails: string[] = [];

        // Collect valid Recipients
        profiles?.forEach((p: any) => {
            if (p.email) emails.push(p.email);
            if (p.push_token) pushTokens.push(p.push_token);
        });

        // 1. Send Emails (BCC to avoid exposing emails)
        if (emails.length > 0) {
            await transporter.sendMail({
                from: '"Bright Store" <brightstore01.info@gmail.com>',
                to: 'brightstore01.info@gmail.com', // Primary TO
                bcc: emails, // Hidden copies to all users
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h1 style="color: #EAB308;">Bright Store Update</h1>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <h3>${subject}</h3>
                        <p style="font-size: 16px; line-height: 1.5;">${body.replace(/\n/g, '<br>')}</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #666;">You are receiving this because you are a registered customer of Bright Store.</p>
                    </div>
                `,
            });
            console.log(`Emails sent to ${emails.length} recipients.`);
        }

        // 2. Send Push Notifications (Expo)
        if (pushTokens.length > 0) {
            // Expo Push API
            // Chunking is recommended for large batches, but simple fetch works for < 100
            const messages = pushTokens.map(token => ({
                to: token,
                sound: 'default',
                title: subject,
                body: body,
                data: { someData: 'goes here' },
            }));

            // Chunk messages into batches of 100 (Expo limit)
            const chunks = chunkArray(messages, 100);

            for (const chunk of chunks) {
                await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Accept-encoding': 'gzip, deflate',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(chunk),
                });
            }
            console.log(`Push notifications sent to ${pushTokens.length} devices.`);
        }

        sentCount = profiles?.length || 0;

        // Log to DB
        await supabase.from('messages').insert({
            subject,
            body,
            sent_via: ['email', 'push'],
            recipient_count: sentCount
        });

        return NextResponse.json({ success: true, recipientCount: sentCount });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function chunkArray(myArray: any[], chunk_size: number) {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];

    for (index = 0; index < arrayLength; index += chunk_size) {
        let myChunk = myArray.slice(index, index + chunk_size);
        tempArray.push(myChunk);
    }
    return tempArray;
}
