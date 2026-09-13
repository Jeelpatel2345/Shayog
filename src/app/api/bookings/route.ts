import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateBookingCode } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const workerProfileId = searchParams.get('workerProfileId');
    const workerName = searchParams.get('workerName');
    const workerPhone = searchParams.get('workerPhone');

    const where: Record<string, unknown> = {};
    if (customerId) where.customerId = customerId;
    if (workerProfileId) where.workerProfileId = workerProfileId;
    if (workerName && workerName.trim()) {
      where.workerProfile = {
        user: {
          fullName: { contains: workerName.trim(), mode: 'insensitive' }
        }
      };
    } else if (workerPhone && workerPhone.trim()) {
      const cleanP = workerPhone.replace(/\D/g, '').slice(-10);
      where.workerProfile = {
        user: {
          phone: { contains: cleanP }
        }
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        customer: true,
        workerProfile: { include: { user: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bookings, success: true });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings', bookings: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Ensure a valid customer exists in the database
    let customer = null;
    if (body.customerId) {
      customer = await prisma.user.findUnique({ where: { id: body.customerId } }).catch(() => null);
    }
    if (!customer && body.customerPhone) {
      const cleanPhone = body.customerPhone.replace(/\D/g, '');
      customer = await prisma.user.findFirst({ where: { phone: { contains: cleanPhone.slice(-10) } } }).catch(() => null);
    }
    if (!customer) {
      // Find any customer or create a default guest customer
      customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } }).catch(() => null);
      if (!customer) {
        customer = await prisma.user.create({
          data: {
            phone: '+919876543210',
            fullName: body.customerName || 'Jeel Patel',
            role: 'CUSTOMER',
          }
        }).catch(() => null);
      }
    }

    // 2. Ensure a valid worker profile exists for the specified worker
    let workerProfile = null;
    if (body.workerProfileId) {
      workerProfile = await prisma.workerProfile.findUnique({ 
        where: { id: body.workerProfileId }, 
        include: { user: true } 
      }).catch(() => null);
    }
    const targetWorkerName = (body.workerName || 'Sunita Mehra').trim();
    if (!workerProfile && body.workerPhone) {
      const cleanWP = body.workerPhone.replace(/\D/g, '').slice(-10);
      workerProfile = await prisma.workerProfile.findFirst({
        where: { user: { phone: { contains: cleanWP } } },
        include: { user: true }
      }).catch(() => null);
    }
    if (!workerProfile && targetWorkerName) {
      workerProfile = await prisma.workerProfile.findFirst({
        where: { user: { fullName: { contains: targetWorkerName, mode: 'insensitive' } } },
        include: { user: true }
      }).catch(() => null);
    }
    if (!workerProfile) {
      // Create dedicated worker profile matching targetWorkerName
      const randDigits = Math.floor(1000000000 + Math.random() * 9000000000).toString();
      const workerPhone = body.workerPhone 
        ? (body.workerPhone.startsWith('+91') ? body.workerPhone : `+91${body.workerPhone.replace(/\D/g, '').slice(-10)}`)
        : `+91${randDigits}`;
      const workerUser = await prisma.user.create({
        data: {
          phone: workerPhone,
          fullName: targetWorkerName,
          role: 'WORKER',
          workerProfile: {
            create: {
              primaryWorkArea: body.city || 'Ahmedabad',
              hourlyRate: body.hourlyRate || 350,
              rating: 4.9,
              yearsExperience: 5,
              verificationStatus: 'APPROVED'
            }
          }
        },
        include: { workerProfile: true }
      }).catch(() => null);
      workerProfile = workerUser?.workerProfile;
    }
    if (!workerProfile) {
      workerProfile = await prisma.workerProfile.findFirst({ include: { user: true } }).catch(() => null);
    }

    if (!customer || !workerProfile) {
      return NextResponse.json({ error: 'Unable to link customer or worker', success: false }, { status: 400 });
    }

    const code = generateBookingCode();
    const serviceFee = body.serviceFee || Math.round((body.totalAmount || 500) * 0.8);
    const platformFee = body.platformFee || 25;
    const gstAmount = body.gstAmount || Math.round(serviceFee * 0.18);
    const totalAmount = body.totalAmount || (serviceFee + platformFee + gstAmount);

    const booking = await prisma.booking.create({
      data: {
        bookingCode: code,
        customerId: customer.id,
        workerProfileId: workerProfile.id,
        serviceTitle: body.serviceTitle || body.serviceName || 'Home Service',
        scheduledDate: new Date(body.scheduledDate || Date.now() + 86400000),
        scheduledTime: body.scheduledTime || body.time || '10:00 AM',
        serviceLocation: body.serviceLocation || body.address || 'Ahmedabad, Gujarat',
        city: body.city || 'Ahmedabad',
        state: 'Gujarat',
        totalAmount: totalAmount,
        serviceFee: serviceFee,
        materialFee: body.materialFee || 0,
        platformFee: platformFee,
        gstAmount: gstAmount,
        paymentMethod: body.paymentMethod || 'UPI',
        workerOtp: body.workerOtp || String(Math.floor(1000 + Math.random() * 9000)),
        paymentTiming: body.paymentTiming || 'AFTER_SERVICE',
        status: body.status || 'CONFIRMED',
      },
      include: {
        customer: true,
        workerProfile: { include: { user: true } },
      }
    });

    return NextResponse.json({ booking, success: true });
  } catch (error: any) {
    console.error('Create booking error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create booking', success: false }, { status: 500 });
  }
}
