import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { buildBacTimeSeries } from '@/lib/alcohol'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tagUid = searchParams.get('tag_uid')
    const stepParam = searchParams.get('step')
    const stepMinutes = stepParam ? Math.max(1, Math.min(60, parseInt(stepParam, 10))) : 15

    if (!tagUid) {
      return NextResponse.json(
        { error: 'Missing tag_uid parameter' },
        { status: 400 }
      )
    }

    // Resolve guest
    const { data: guest } = await supabaseAdmin
      .from('guests')
      .select('id, gender')
      .eq('tag_uid', tagUid)
      .single()

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    // Fetch guest drink orders with required alcohol fields
    const { data: orders } = await supabaseAdmin
      .from('drink_orders')
      .select(`
        quantity,
        ordered_at,
        drink_menu!inner(alcohol_percentage, alcohol_content_ml)
      `)
      .eq('guest_id', guest.id)
      .order('ordered_at', { ascending: true })

    const now = new Date()

    if (!orders || orders.length === 0) {
      return NextResponse.json({ labels: [], values: [] })
    }

    // Determine start time aligned to step
    const firstOrder = new Date(orders[0].ordered_at)
    const start = new Date(firstOrder)
    const minutes = start.getMinutes()
    start.setMinutes(Math.floor(minutes / stepMinutes) * stepMinutes, 0, 0)
    // Ensure the first bucket starts 15 minutes before the first drink for a zero baseline
    start.setTime(start.getTime() - 15 * 60 * 1000)

    const { labels, values } = buildBacTimeSeries(orders as any, (guest as any).gender, start, now, stepMinutes)

    return NextResponse.json({ labels, values })

  } catch (error) {
    console.error('Error building alcohol time series:', error)
    return NextResponse.json(
      { error: 'Failed to build alcohol time series' },
      { status: 500 }
    )
  }
}


