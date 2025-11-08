import { useState, useEffect, useCallback, useRef } from 'react';
import { getApiUrl } from './useApi';

type Goal = {
  id: number;
  goal_type: string;
  target_value: number;
  current_value: number;
  description: string;
  target_task_name?: string;
  completed_at?: string;
};

export function useGoalNotifications() {
  const [notifications, setNotifications] = useState<Goal[]>([]);
  const lastCheckRef = useRef<string | null>(null);
  const shownGoalsRef = useRef<Set<string>>(new Set()); // Track by "id-timestamp" for re-triggering

  const checkAchievements = useCallback(async () => {
    try {
      // Build URL with optional since parameter
      const params = new URLSearchParams();
      if (lastCheckRef.current) {
        params.append('since', lastCheckRef.current);
      }
      
      const url = getApiUrl(`/api/goals/check-achievements${params.toString() ? `?${params.toString()}` : ''}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        // Silently fail if endpoint not available (e.g., server not restarted)
        if (response.status === 404) return;
        console.warn('Goal achievements check failed:', response.status);
        return;
      }
      
      const data = await response.json();
      const achievements = data.achievements || [];
      
      // Filter out goals we've already shown (by id + timestamp combo)
      const newAchievements = achievements.filter((goal: Goal) => {
        const key = `${goal.id}-${goal.completed_at}`;
        return !shownGoalsRef.current.has(key);
      });
      
      if (newAchievements.length > 0) {
        // Add to notification queue
        setNotifications(prev => [...prev, ...newAchievements]);
        
        // Mark as shown (by id + timestamp)
        newAchievements.forEach((goal: Goal) => {
          const key = `${goal.id}-${goal.completed_at}`;
          shownGoalsRef.current.add(key);
        });
      }
      
      // Update last check time
      lastCheckRef.current = new Date().toISOString();
      
    } catch (error) {
      console.error('Failed to check goal achievements:', error);
    }
  }, []);

  // Check for achievements every 10 seconds
  useEffect(() => {
    // Initial check
    checkAchievements();
    
    // Set up interval
    const interval = setInterval(checkAchievements, 10000);
    
    return () => clearInterval(interval);
  }, [checkAchievements]);

  const dismissNotification = useCallback((goalId: number) => {
    setNotifications(prev => prev.filter(g => g.id !== goalId));
  }, []);

  return {
    notifications,
    dismissNotification,
    checkAchievements, // Allow manual checking
  };
}
