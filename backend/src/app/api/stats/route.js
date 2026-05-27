import { NextResponse } from 'next/server'
import { stats, featuredQuote } from '../../../data/posts'

export async function GET() {
  return NextResponse.json({ stats, featuredQuote })
}
