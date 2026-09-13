import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { defaultActiveCommunityBooking, CommunityBooking } from '@/data/communityData';

// Cache fallback for community bookings with multi-worker crew data
let communityBookingsStore: CommunityBooking[] = [defaultActiveCommunityBooking];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const societyId = searchParams.get('societyId');

    let dbCommunityBookings: any[] = [];
    try {
      const dbBookings = await prisma.booking.findMany({
        where: {
          serviceTitle: { contains: '[Community' }
        },
        include: {
          workerProfile: { include: { user: true } },
          customer: true
        },
        orderBy: { createdAt: 'desc' }
      });

      dbCommunityBookings = dbBookings.map((b: any) => ({
        id: b.id,
        societyId: b.city ? 'soc-' + b.city.toLowerCase() : 'soc-101',
        societyName: b.serviceLocation || 'Shanti Heights Resident Society',
        packageId: 'comm-custom',
        packageTitle: b.serviceTitle.replace(/^\[Community:.*?\]\s*/, ''),
        crewSize: 4,
        leadWorkerName: b.workerProfile?.user?.fullName || 'Mahesh Barot',
        crewRoster: defaultActiveCommunityBooking.crewRoster,
        scheduledDate: b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString('en-IN') : 'Today',
        scheduledTime: b.scheduledTime || '02:00 PM',
        totalAmount: b.totalAmount || 4200,
        workerOtp: b.workerOtp || '9240',
        status: b.status === 'COMPLETED' ? 'COMPLETED' : b.status === 'IN_PROGRESS' ? 'IN_PROGRESS' : 'CREW_EN_ROUTE',
        orderedBy: b.customer?.fullName || 'Society Resident',
        ordererPhone: b.customer?.phone || '+91 98250 11223',
        poolSharePerWorker: Math.round((b.totalAmount || 4200) / 4),
        createdAt: b.createdAt.toISOString()
      }));
    } catch {}

    const all = [...dbCommunityBookings, ...communityBookingsStore];
    const map = new Map();
    all.forEach(item => map.set(item.id, item));
    let result = Array.from(map.values());

    if (societyId) {
      result = result.filter(b => b.societyId === societyId || b.societyName.toLowerCase().includes(societyId.toLowerCase()));
    }

    return NextResponse.json({ success: true, bookings: result });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch community bookings', bookings: communityBookingsStore }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const id = body.id || ('comm_bk_' + Date.now().toString(36));
    const generatedOtp = body.workerOtp || String(Math.floor(1000 + Math.random() * 9000));
    const totalAmount = body.totalAmount || 4200;
    const crewSize = body.crewSize || 4;

    const newBooking: CommunityBooking = {
      id,
      societyId: body.societyId || 'soc-101',
      societyName: body.societyName || 'Shanti Heights Resident Society',
      packageId: body.packageId || 'comm-pkg-1',
      packageTitle: body.packageTitle || 'Full Society Water Tank Disinfection',
      crewSize,
      leadWorkerName: body.leadWorkerName || 'Mahesh Barot',
      crewRoster: body.crewRoster || defaultActiveCommunityBooking.crewRoster,
      scheduledDate: body.scheduledDate || 'Today, 02:00 PM',
      scheduledTime: body.scheduledTime || '02:00 PM - 06:00 PM',
      totalAmount,
      workerOtp: generatedOtp,
      status: 'CREW_EN_ROUTE',
      orderedBy: body.orderedBy || 'Society Resident (Flat 402)',
      ordererPhone: body.ordererPhone || '+91 98250 11223',
      poolSharePerWorker: Math.round(totalAmount / crewSize),
      createdAt: new Date().toISOString()
    };

    communityBookingsStore.unshift(newBooking);

    // Also persist into PostgreSQL Prisma Booking table
    try {
      let customer = await prisma.user.findFirst({ where: { role: 'CUSTOMER' } });
      if (!customer) {
        customer = await prisma.user.create({
          data: { phone: '+919825011223', fullName: body.orderedBy || 'Kiritbhai Shah', role: 'CUSTOMER' }
        });
      }

      let workerProfile = await prisma.workerProfile.findFirst({
        where: { user: { fullName: { contains: body.leadWorkerName || 'Mahesh Barot', mode: 'insensitive' } } },
        include: { user: true }
      });

      if (!workerProfile) {
        workerProfile = await prisma.workerProfile.findFirst({ include: { user: true } });
      }

      if (workerProfile && customer) {
        await prisma.booking.create({
          data: {
            id,
            bookingCode: 'COMM-' + Math.floor(1000 + Math.random() * 9000),
            customerId: customer.id,
            workerProfileId: workerProfile.id,
            serviceTitle: '[Community: ' + newBooking.societyName + '] ' + newBooking.packageTitle + ' (' + crewSize + ' Workers Crew)',
            scheduledDate: new Date(),
            scheduledTime: newBooking.scheduledTime,
            serviceLocation: newBooking.societyName + ', Ahmedabad',
            city: 'Ahmedabad',
            state: 'Gujarat',
            totalAmount,
            serviceFee: Math.round(totalAmount * 0.8),
            platformFee: 50,
            gstAmount: Math.round(totalAmount * 0.18),
            workerOtp: generatedOtp,
            paymentTiming: 'AFTER_SERVICE',
            status: 'CONFIRMED'
          }
        });
      }
    } catch (dbErr) {
      console.warn('PostgreSQL community booking persistence notice:', dbErr);
    }

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create community booking', success: false }, { status: 500 });
  }
}
