import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import type { NodeStatus } from '@/lib/firestore'

/**
 * GET /api/progress - Load user progress for a roadmap
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const roadmapSlug = searchParams.get('roadmapSlug')

    if (!userId || !roadmapSlug) {
      return NextResponse.json(
        { error: 'userId and roadmapSlug are required' },
        { status: 400 }
      )
    }

    const docId = `${userId}_${roadmapSlug}`
    const db = await getDatabase()
    const collection = db.collection('userProgress')
    
    const progressDoc = await collection.findOne({ id: docId })

    if (progressDoc) {
      const nodeStatuses = progressDoc.nodeStatuses
      if (nodeStatuses && typeof nodeStatuses === 'object') {
        return NextResponse.json({ nodeStatuses })
      }
    }

    return NextResponse.json({ nodeStatuses: null })
  } catch (error) {
    console.error('[API] Error loading progress:', error)
    return NextResponse.json(
      { error: 'Failed to load progress' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/progress - Save or update user progress
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, roadmapSlug, nodeStatuses, nodeId, status } = body

    if (!userId || !roadmapSlug) {
      return NextResponse.json(
        { error: 'userId and roadmapSlug are required' },
        { status: 400 }
      )
    }

    const docId = `${userId}_${roadmapSlug}`
    const db = await getDatabase()
    const collection = db.collection('userProgress')

    // If nodeId and status are provided, update a single node
    if (nodeId && status) {
      const progressDoc = await collection.findOne({ id: docId })

      if (progressDoc) {
        const currentStatuses = progressDoc.nodeStatuses || {}
        const updatedStatuses = {
          ...currentStatuses,
          [nodeId]: status as NodeStatus,
        }
        await collection.updateOne(
          { id: docId },
          {
            $set: {
              nodeStatuses: updatedStatuses,
              updatedAt: new Date(),
            }
          }
        )
      } else {
        await collection.insertOne({
          id: docId,
          userId,
          roadmapSlug,
          nodeStatuses: { [nodeId]: status as NodeStatus },
          updatedAt: new Date(),
        })
      }
    } else if (nodeStatuses) {
      // Save full progress
      await collection.updateOne(
        { id: docId },
        {
          $set: {
            userId,
            roadmapSlug,
            nodeStatuses,
            updatedAt: new Date(),
          }
        },
        { upsert: true }
      )
    } else {
      return NextResponse.json(
        { error: 'Either nodeStatuses or (nodeId and status) are required' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error saving progress:', error)
    return NextResponse.json(
      { error: 'Failed to save progress' },
      { status: 500 }
    )
  }
}
