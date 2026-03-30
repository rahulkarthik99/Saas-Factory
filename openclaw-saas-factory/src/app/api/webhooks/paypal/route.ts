import { NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Verification step (simplified for webhook testing purposes)
    // You would normally check the PayPal signature headers here
    if (body.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const subscriptionId = body.resource.id;
      const customerEmail = body.resource.subscriber.email_address;

      const user = await prisma.user.update({
        where: { email: customerEmail },
        data: {
          plan: 'PRO',
          subscriptionId: subscriptionId
        }
      });

      console.log(`Updated user ${user.email} to PRO via PayPal`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }
}
