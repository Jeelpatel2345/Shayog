import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id: params.id },
          { bookingCode: params.id }
        ]
      },
      include: {
        customer: true,
        workerProfile: { include: { user: true } },
        payment: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ booking, success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id: params.id },
          { bookingCode: params.id }
        ]
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.paymentMethod ? { paymentMethod: body.paymentMethod } : {}),
        ...(body.paymentTiming ? { paymentTiming: body.paymentTiming } : {}),
        ...(body.trackingProgress !== undefined ? { trackingProgress: body.trackingProgress } : {}),
      },
      include: {
        customer: true,
        workerProfile: { include: { user: true } },
      }
    });

    return NextResponse.json({ booking: updated, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update booking' }, { status: 500 });
  }
}
