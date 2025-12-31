"use client";
import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import type { Roadmap } from "@/types/roadmap";
import { sanitizeAndParseHTML } from "@/lib/utils";
import { useAuth } from "./AuthProvider";
import { loadUserProgress, updateNodeStatus, type NodeStatus } from "@/lib/firestore";

// A helper component for animated paths
const AnimatedPath = ({
  d,
  index,
  arrowAtEnd = true,
}: {
  d: string;
  index: number;
  arrowAtEnd?: boolean;
}) => {
  return (
    <path
      d={d}
      className="animate-draw"
      style={{ animationDelay: `${index * 150 + 500}ms` }}
      fill="none"
      strokeWidth="2.5"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      markerEnd={arrowAtEnd ? "url(#arrowhead)" : undefined}
    />
  );
};

export default function StaticRoadmap({ roadmap }: { roadmap: Roadmap }) {
  const { user, loading: authLoading } = useAuth();
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    label: string;
    description?: string;
    completed?: boolean;
  } | null>(null);

  // Status per node id (default: "inprogress")
  const [nodeStatus, setNodeStatus] = useState<Record<string, NodeStatus>>({});
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const lastLoadedSlugRef = useRef<string | null>(null);

  // Load saved progress when user is authenticated
  useEffect(() => {
    if (authLoading) {
      console.log('[RoadmapDiagram] Auth still loading, skipping MongoDB load');
      return;
    }

    // Prevent loading the same roadmap twice (unless roadmap slug changed)
    const shouldSkip = hasLoadedOnce && lastLoadedSlugRef.current === roadmap.slug && user;
    if (shouldSkip) {
      console.log('[RoadmapDiagram] Already loaded this roadmap, skipping');
      return;
    }

    const loadProgress = async () => {
      if (user) {
        try {
          setLoadingProgress(true);
          console.log('[RoadmapDiagram] Loading progress for user:', user.uid, 'roadmap:', roadmap.slug);
          const savedStatuses = await loadUserProgress(user, roadmap.slug);
          console.log('[RoadmapDiagram] Loaded statuses:', savedStatuses, 'Type:', typeof savedStatuses, 'Is object:', savedStatuses && typeof savedStatuses === 'object');
          
          // Update state with saved statuses
          // If savedStatuses is null, it means no document exists - keep defaults
          // If savedStatuses is an object (even if empty), use it to ensure consistency
          if (savedStatuses !== null && typeof savedStatuses === 'object') {
            console.log('[RoadmapDiagram] Setting nodeStatus with', Object.keys(savedStatuses).length, 'statuses:', savedStatuses);
            setNodeStatus(savedStatuses);
          } else {
            console.log('[RoadmapDiagram] No saved statuses found (null or invalid), keeping defaults');
            // Only reset to empty object if this is a new roadmap (slug changed)
            if (lastLoadedSlugRef.current !== roadmap.slug) {
              setNodeStatus({});
            }
          }
          // Always mark as loaded once, even if no saved data exists
          setHasLoadedOnce(true);
          lastLoadedSlugRef.current = roadmap.slug;
        } catch (error) {
          console.error("[RoadmapDiagram] Error loading progress:", error);
          // Mark as loaded even on error to prevent infinite loading state
          setHasLoadedOnce(true);
          lastLoadedSlugRef.current = roadmap.slug;
        } finally {
          setLoadingProgress(false);
        }
      } else {
        // No user - no need to load, allow defaults immediately
        console.log('[RoadmapDiagram] No user, skipping MongoDB load');
        setLoadingProgress(false);
        setHasLoadedOnce(true);
        lastLoadedSlugRef.current = roadmap.slug;
      }
    };

    loadProgress();
  }, [user, roadmap.slug, authLoading]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimeoutRef.current).forEach((timeout) => {
        if (timeout) clearTimeout(timeout);
      });
    };
  }, []);

  // Determine if we should show loading state
  // Show loading overlay when: (auth is loading) OR (user exists AND we're loading progress AND haven't loaded once)
  const isLoading = authLoading || (loadingProgress && user !== null && !hasLoadedOnce);
  
  const getStatus = (id: string): NodeStatus => {
    // After loading completes (or no user), return saved status or default
    return nodeStatus[id] ?? "inprogress";
  };
  
  const setStatus = useCallback((id: string, status: NodeStatus) => {
    setNodeStatus((prev) => {
      const updated = { ...prev, [id]: status };
      console.log('[RoadmapDiagram] Setting status for node', id, 'to', status, 'Updated state:', updated);
      
      // Save to MongoDB if user is authenticated
      if (user && !authLoading) {
        // Clear any pending save for this node
        if (saveTimeoutRef.current[id]) {
          clearTimeout(saveTimeoutRef.current[id]);
        }
        
        // Debounce the save operation
        saveTimeoutRef.current[id] = setTimeout(async () => {
          try {
            console.log('[RoadmapDiagram] Saving status to MongoDB:', id, status);
            await updateNodeStatus(user, roadmap.slug, id, status);
            console.log('[RoadmapDiagram] Successfully saved status to MongoDB');
          } catch (error) {
            console.error("[RoadmapDiagram] Error saving progress:", error);
          }
        }, 500); // 500ms debounce
      } else {
        console.log('[RoadmapDiagram] Not saving to MongoDB - user:', !!user, 'authLoading:', authLoading);
      }
      
      return updated;
    });
  }, [user, roadmap.slug, authLoading]);

  const allNodes = useMemo(() => {
    const nodes: Array<{
      id: string;
      label: string;
      description?: string;
      completed?: boolean;
    }> = [];
    roadmap.stages.forEach((stage) => {
      stage.nodes.forEach((node) => {
        nodes.push({
          id: node.id,
          label: node.label,
          description: node.description,
          completed: node.completed,
        });
      });
    });
    return nodes;
  }, [roadmap]);

  const nodeSlots = useMemo(() => allNodes, [allNodes]);

  // Layout constants of nodes
  const nodeWidth = 200;
  const nodeHeight = 90;
  const horizontalGap = 70;
  const verticalGap = 100;
  const nodesPerRow = 4;

  // Extra space to keep borders, rounded corners, box-shadows, and arrowheads visible
  const canvasPadding = 48;

  const totalNodes = nodeSlots.length;
  const totalRows = Math.ceil(totalNodes / nodesPerRow);

  const innerWidth =
    Math.min(nodesPerRow, totalNodes) * nodeWidth +
    (Math.min(nodesPerRow, totalNodes) - 1) * horizontalGap;
  const innerHeight = totalRows * nodeHeight + (totalRows - 1) * verticalGap;

  const containerWidth = innerWidth + canvasPadding * 2;
  const containerHeight = innerHeight + canvasPadding * 2;

  const nodePositions = useMemo(
    () =>
      nodeSlots.map((_, index) => {
        const row = Math.floor(index / nodesPerRow);
        const col = index % nodesPerRow;
        const reversedCol = nodesPerRow - 1 - col;

        return {
          x:
            (row % 2 === 0 ? col : reversedCol) * (nodeWidth + horizontalGap) +
            canvasPadding,
          y: row * (nodeHeight + verticalGap) + canvasPadding,
        };
      }),
    [
      nodeSlots,
      nodesPerRow,
      nodeWidth,
      nodeHeight,
      horizontalGap,
      verticalGap,
      canvasPadding,
    ]
  );

  const paths = useMemo(() => {
    const generatedPaths: { d: string; arrowAtEnd?: boolean }[] = [];
    if (nodeSlots.length < 2) return [];

    for (let i = 0; i < nodeSlots.length - 1; i++) {
      const fromPos = nodePositions[i];
      const toPos = nodePositions[i + 1];

      const sameRow =
        Math.floor(i / nodesPerRow) === Math.floor((i + 1) / nodesPerRow);

      if (sameRow) {
        const fromX = fromPos.x + nodeWidth / 2;
        const fromY = fromPos.y + nodeHeight / 2;
        const toX = toPos.x + nodeWidth / 2;
        const toY = toPos.y + nodeHeight / 2;
        generatedPaths.push({
          d: `M ${fromX} ${fromY} Q ${(fromX + toX) / 2} ${fromY}, ${toX} ${toY}`,
          arrowAtEnd: true,
        });
      } else {
        const fromX = fromPos.x + nodeWidth / 2;
        const fromY = fromPos.y + nodeHeight;
        const toX = toPos.x + nodeWidth / 2;
        const toY = toPos.y;
        const midY = (fromY + toY) / 2;
        generatedPaths.push({
          d: `M ${fromX} ${fromY} Q ${fromX} ${midY}, ${toX} ${toY}`,
          arrowAtEnd: true,
        });
      }
    }

    return generatedPaths;
  }, [nodeSlots.length, nodePositions, nodeWidth, nodeHeight, nodesPerRow]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-black">
      <div className="rounded-2xl border border-indigo-200 dark:border-gray-700 bg-white dark:bg-black shadow-xl p-6 flex justify-center relative">
        {/* Loading overlay when fetching MongoDB data */}
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <svg className="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm text-slate-600 dark:text-slate-400">Loading your progress...</p>
            </div>
          </div>
        )}
        
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:24px_24px]" />
          </div>
        </div>

        <div className="hidden md:block relative z-10">
          <div
            className="relative"
            style={{ width: containerWidth, height: containerHeight }}
          >
            <svg
              className="absolute inset-0 pointer-events-none text-indigo-400 dark:text-indigo-500"
              width={containerWidth}
              height={containerHeight}
              viewBox={`0 0 ${containerWidth} ${containerHeight}`}
              style={{ zIndex: 1, overflow: "visible" }}
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="10"
                  refX="8"
                  refY="5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
                </marker>
              </defs>

              {paths.map((path, index) => (
                <AnimatedPath
                  key={index}
                  d={path.d}
                  index={index}
                  arrowAtEnd={path.arrowAtEnd}
                />
              ))}
            </svg>

            <div className="relative" style={{ zIndex: 2 }}>
              {nodeSlots.map((node, index) => (
                <div
                  key={index}
                  className="absolute animate-fadeInSlideUp"
                  style={{
                    left: nodePositions[index].x,
                    top: nodePositions[index].y,
                    width: nodeWidth,
                    height: nodeHeight,
                    animationDelay: `${index * 150}ms`,
                    opacity: 0,
                  }}
                >
                  {(() => {
                    const status = getStatus(node.id);
                    const cardBase =
                      "w-full h-full p-3 bg-gradient-to-br rounded-2xl shadow-md flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-xl border";
                    const cardVariant =
                      status === "done"
                        ? " from-white to-green-400 dark:from-gray-800 dark:to-gray-950 border-green-700 dark:border-green-600"
                        : status === "skip"
                        ? " from-white to-gray-400 dark:from-gray-800 dark:to-gray-950 border-gray-700 dark:border-gray-600"
                        : " from-white to-yellow-50 dark:from-gray-800 dark:to-gray-950 border-yellow-300 dark:border-yellow-600";

                    const circleBase =
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 shadow-sm bg-white/60 dark:bg-white/5 border-2";
                    const circleVariant =
                      status === "done"
                        ? " border-green-500 text-green-700 dark:text-green-400"
                        : status === "skip"
                        ? " border-gray-500 text-gray-700 dark:text-gray-300"
                        : " border-yellow-500 text-yellow-700 dark:text-yellow-400";

                    return (
                      <div
                        className={cardBase + cardVariant}
                        onClick={() => node && setSelectedNode(node)}
                      >
                        <div className={circleBase + circleVariant}>
                          {index + 1}
                        </div>
                        <div className="font-semibold text-slate-800 dark:text-gray-200 text-xs leading-tight">
                          {node.label}
                        </div>
                        {node.completed && (
                          <div className="mt-1 text-xs text-green-600 font-medium">
                            ✓ Completed
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile (stacked list) */}
        <div className="md:hidden z-10">
          <div className="space-y-4">
            {nodeSlots.map((node, index) => (
              <div
                key={index}
                className="relative animate-fadeInSlideUp"
                style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
              >
                {(() => {
                  const status = getStatus(node.id);
                  const cardBase =
                    "min-w-[240px] p-4 bg-gradient-to-br rounded-2xl shadow-md flex flex-col items-center text-center mx-auto cursor-pointer transition-transform duration-200 active:scale-95 border";
                  const cardVariant =
                    status === "done"
                      ? " from-white to-green-50 dark:from-gray-800 dark:to-gray-950 border-green-300 dark:border-green-600"
                      : status === "skip"
                      ? " from-white to-gray-50 dark:from-gray-800 dark:to-gray-950 border-gray-300 dark:border-gray-600"
                      : " from-white to-yellow-50 dark:from-gray-800 dark:to-gray-950 border-yellow-300 dark:border-yellow-600";

                  const circleBase =
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 shadow-sm bg-white/60 dark:bg-white/5 border-2";
                  const circleVariant =
                    status === "done"
                      ? " border-green-500 text-green-700 dark:text-green-400"
                      : status === "skip"
                      ? " border-gray-500 text-gray-700 dark:text-gray-300"
                      : " border-yellow-500 text-yellow-700 dark:text-yellow-400";

                  return (
                    <div
                      className={cardBase + cardVariant}
                      onClick={() => node && setSelectedNode(node)}
                    >
                      <div className={circleBase + circleVariant}>{index + 1}</div>
                      <div className="font-semibold text-slate-800 dark:text-gray-200 text-base leading-tight">
                        {node.label}
                      </div>
                      {node.completed && (
                        <div className="mt-1 text-xs text-green-600 font-medium">
                          ✓ Completed
                        </div>
                      )}
                    </div>
                  );
                })()}
                {index < nodeSlots.length - 1 && (
                  <div className="flex justify-center mt-2">
                    <svg
                      width="2"
                      height="40"
                      className="text-indigo-300 dark:text-indigo-500"
                    >
                      <line
                        x1="1"
                        y1="0"
                        x2="1"
                        y2="40"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Details drawer */}
      <div
        className={`fixed right-0 top-0 z-30 h-full w-[800px] max-w-[95vw] transform border-l border-indigo-200 dark:border-gray-700 bg-white dark:bg-black shadow-xl transition-transform duration-300 translate-x-0' ${
          selectedNode ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-indigo-100 dark:border-gray-700 p-3">
          <div className="text-base font-medium text-slate-800 dark:text-gray-200">
            Details
          </div>
          <button
            type="button"
            onClick={() => setSelectedNode(null)}
            className="rounded-md border border-slate-300 dark:border-gray-600 px-2 py-1 text-xs text-slate-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-700"
          >
            Close
          </button>
        </div>
        <div className="h-[calc(100%-44px)] overflow-y-auto p-4">
          {selectedNode ? (
            <NodeDetails
              node={selectedNode}
              roadmap={roadmap}
              status={getStatus(selectedNode.id)}
              onChangeStatus={(s) => setStatus(selectedNode.id, s)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function StatusDropdown({
  value,
  onChange,
}: {
  value: "inprogress" | "done" | "skip";
  onChange: (v: "inprogress" | "done" | "skip") => void;
}) {
  const [open, setOpen] = useState(false);

  const label =
    value === "done" ? "Done" : value === "skip" ? "Skip" : "In Progress";
  const dotColor =
    value === "done"
      ? "bg-green-500"
      : value === "skip"
      ? "bg-gray-500"
      : "bg-yellow-400";

  return (
    <div className="relative" onBlur={() => setOpen(false)} tabIndex={0}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-xs text-slate-700 dark:text-gray-200 shadow-sm hover:bg-slate-50 dark:hover:bg-gray-700"
      >
        <span className={`inline-block h-2.5 w-2.5 rounded-full ${dotColor}`} />
        {label}
        <svg
          className="h-3 w-3 text-slate-500 dark:text-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open ? (
        <div className="absolute right-0 z-10 mt-1 w-36 origin-top-right rounded-md border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black/5">
          <div className="py-1 text-sm">
            <button
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange("done");
                setOpen(false);
              }}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              Done
            </button>
            <button
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange("inprogress");
                setOpen(false);
              }}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
              In Progress
            </button>
            <button
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-200"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange("skip");
                setOpen(false);
              }}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-gray-500" />
              Skip
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function NodeDetails({
  node,
  roadmap,
  status,
  onChangeStatus,
}: {
  node: {
    id: string;
    label: string;
    description?: string;
    completed?: boolean;
  };
  roadmap: Roadmap;
  status: "inprogress" | "done" | "skip";
  onChangeStatus: (status: "inprogress" | "done" | "skip") => void;
}) {
  const fullNode = useMemo(() => {
    for (const stage of roadmap.stages) {
      const found = stage.nodes.find((n) => n.id === node.id);
      if (found) return found;
    }
    return null;
  }, [node.id, roadmap]);

  if (!fullNode)
    return (
      <div className="text-sm text-slate-500 dark:text-gray-400">
        Node not found
      </div>
    );

  return (
    <div className="text-slate-800 dark:text-gray-200">
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg font-semibold">{fullNode.label}</div>
        <StatusDropdown value={status} onChange={onChangeStatus} />
      </div>

      {fullNode.description && (
        <div className="mt-2 text-base text-slate-600 dark:text-gray-400 leading-relaxed">
          {sanitizeAndParseHTML(fullNode.description)}
        </div>
      )}

      {fullNode.resources?.length ? (
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium text-slate-700 dark:text-gray-300">
            Resources
          </div>
          <ul className="space-y-2">
            {fullNode.resources.map((r, i) => (
              <li key={i}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {r.title}{" "}
                  <span className="text-xs text-slate-500 dark:text-gray-400">
                    ({r.type})
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}