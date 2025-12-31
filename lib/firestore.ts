import type { User } from 'firebase/auth'

export type NodeStatus = 'inprogress' | 'done' | 'skip'

export interface UserProgress {
  roadmapSlug: string
  nodeStatuses: Record<string, NodeStatus>
  updatedAt: Date
}

/**
 * Save user progress for a specific roadmap
 */
export async function saveUserProgress(
  user: User,
  roadmapSlug: string,
  nodeStatuses: Record<string, NodeStatus>
): Promise<void> {
  if (!user) {
    throw new Error('User must be authenticated to save progress')
  }

  const response = await fetch('/api/progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: user.uid,
      roadmapSlug,
      nodeStatuses,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save progress')
  }
}

/**
 * Load user progress for a specific roadmap
 */
export async function loadUserProgress(
  user: User,
  roadmapSlug: string
): Promise<Record<string, NodeStatus> | null> {
  if (!user) {
    console.log('[MongoDB] loadUserProgress: No user provided')
    return null
  }

  const docId = `${user.uid}_${roadmapSlug}`
  console.log('[MongoDB] Loading progress for doc:', docId)
  
  const response = await fetch(
    `/api/progress?userId=${encodeURIComponent(user.uid)}&roadmapSlug=${encodeURIComponent(roadmapSlug)}`
  )

  if (!response.ok) {
    console.error('[MongoDB] Failed to load progress:', response.statusText)
    return null
  }

  const data = await response.json()
  
  if (data.nodeStatuses && typeof data.nodeStatuses === 'object') {
    console.log('[MongoDB] Returning nodeStatuses:', data.nodeStatuses)
    return data.nodeStatuses as Record<string, NodeStatus>
  } else {
    console.log('[MongoDB] nodeStatuses is missing or invalid')
    return null
  }
}

/**
 * Update a single node status
 */
export async function updateNodeStatus(
  user: User,
  roadmapSlug: string,
  nodeId: string,
  status: NodeStatus
): Promise<void> {
  if (!user) {
    throw new Error('User must be authenticated to update progress')
  }

  const docId = `${user.uid}_${roadmapSlug}`
  console.log('[MongoDB] updateNodeStatus: doc:', docId, 'nodeId:', nodeId, 'status:', status)
  
  const response = await fetch('/api/progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId: user.uid,
      roadmapSlug,
      nodeId,
      status,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to update progress')
  }

  console.log('[MongoDB] Successfully updated document')
}
