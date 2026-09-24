import { NextRequest, NextResponse } from 'next/server';
import { allWorkers, serviceCategories } from '@/data/workersData';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase();
    const city = searchParams.get('city')?.toLowerCase();
    const limit = parseInt(searchParams.get('limit') || '50');

    let filtered = [...allWorkers];

    if (category && category !== 'all') {
      filtered = filtered.filter(w => 
        w.category.toLowerCase() === category.toLowerCase() ||
        w.category.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (city && city !== 'all') {
      filtered = filtered.filter(w => w.city.toLowerCase().includes(city));
    }

    if (search) {
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(search) ||
        w.title.toLowerCase().includes(search) ||
        w.locality.toLowerCase().includes(search) ||
        w.city.toLowerCase().includes(search) ||
        w.skills.some(s => s.toLowerCase().includes(search)) ||
        w.bio.toLowerCase().includes(search)
      );
    }

    const total = filtered.length;
    const workers = filtered.slice(0, limit);

    return NextResponse.json({
      success: true,
      total,
      categories: serviceCategories,
      workers,
    });
  } catch (error) {
    console.error('Workers API error:', error);
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }
}
