import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { name, description, category = 'breakfast' } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('food_menu')
      .insert([
        {
          name,
          description,
          category,
          available: true,
        },
      ])
      .select()

    if (error) {
      console.error('Error adding food option:', error)
      return NextResponse.json({ error: 'Failed to add food option' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error adding food option:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 