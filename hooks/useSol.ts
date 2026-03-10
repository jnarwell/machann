"use client";

import { useState, useEffect, useCallback } from "react";
import { solGroup as fallbackData, SolGroup, SolMember } from "@/data/sol";

interface UseSolResult {
  group: SolGroup | null;
  members: SolMember[];
  isLoading: boolean;
  error: string | null;
  source: "live" | "fallback";
  refresh: () => Promise<void>;
  updateMemberStatus: (
    memberId: string,
    action: "markPaid" | "markLate" | "setRecipient",
    amount?: number
  ) => Promise<void>;
}

interface UseSolOptions {
  groupId?: string;
  refreshInterval?: number; // ms, 0 to disable
}

/**
 * Hook for fetching Sol group data
 * Automatically falls back to mock data if API is unavailable
 */
export function useSol(options: UseSolOptions = {}): UseSolResult {
  const { groupId, refreshInterval = 0 } = options;

  const [group, setGroup] = useState<SolGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"live" | "fallback">("fallback");

  const fetchGroup = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = groupId ? `/api/sol?groupId=${groupId}` : "/api/sol";
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      // Transform API response to match SolGroup interface
      const solGroupData: SolGroup = {
        groupName: data.groupName,
        ownerName: data.members?.[0]?.name?.split(" ")[0] || "Group",
        currentCycle: data.currentCycle,
        totalCycles: data.totalCycles,
        poolPerCycle: data.poolPerCycle,
        contributionPerMember: data.contributionPerMember,
        currentRecipientIndex: data.currentRecipientIndex,
        nextCycleDate: new Date(data.nextCycleDate).toLocaleDateString("fr-HT", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        members: data.members.map((m: SolMember & { cycleOrder?: number }) => ({
          id: m.id,
          name: m.name,
          location: m.location || "",
          status: m.status as "paid" | "recipient" | "upcoming" | "late",
          paidAmount: m.paidAmount,
          avatarColor: m.avatarColor,
          initials: m.initials,
        })),
      };

      setGroup(solGroupData);
      setSource("live");
    } catch (err) {
      console.error("Failed to fetch sol group:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch sol group");

      // Fall back to mock data
      setGroup(fallbackData);
      setSource("fallback");
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const updateMemberStatus = useCallback(
    async (
      memberId: string,
      action: "markPaid" | "markLate" | "setRecipient",
      amount?: number
    ) => {
      try {
        const response = await fetch("/api/sol", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            memberId,
            groupId,
            action,
            amount,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to update member");
        }

        // Refresh group data after update
        await fetchGroup();
      } catch (err) {
        console.error("Failed to update member status:", err);
        throw err;
      }
    },
    [groupId, fetchGroup]
  );

  // Initial fetch
  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(fetchGroup, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, fetchGroup]);

  return {
    group,
    members: group?.members || [],
    isLoading,
    error,
    source,
    refresh: fetchGroup,
    updateMemberStatus,
  };
}

/**
 * Hook for getting user's sol groups
 * For the future when users can have multiple groups
 */
export function useUserSolGroups() {
  const [groups, setGroups] = useState<Array<{ id: string; groupName: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Implement /api/sol/my-groups endpoint
    // For now, return empty (user has no groups until they create/join one)
    setGroups([]);
    setIsLoading(false);
  }, []);

  return { groups, isLoading, error };
}
