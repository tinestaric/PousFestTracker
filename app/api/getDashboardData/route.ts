import { NextRequest, NextResponse } from 'next/server'
import { proxySupabaseFunction } from '@/lib/api/proxySupabaseFunction'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tag_uid = searchParams.get('tag_uid')

    if (!tag_uid) {
      return NextResponse.json(
        { error: 'tag_uid parameter is required' },
        { status: 400 }
      )
    }

    const response = await proxySupabaseFunction('getDashboardData', {
      method: 'GET',
      params: { tag_uid },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 