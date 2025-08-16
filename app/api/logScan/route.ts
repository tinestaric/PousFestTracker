import { NextRequest, NextResponse } from 'next/server'
import { proxySupabaseFunction } from '@/lib/api/proxySupabaseFunction'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tag_uid } = body

    if (!tag_uid) {
      return NextResponse.json(
        { error: 'tag_uid is required' },
        { status: 400 }
      )
    }

    const response = await proxySupabaseFunction('logScan', {
      method: 'POST',
      body: { tag_uid },
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error processing scan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 