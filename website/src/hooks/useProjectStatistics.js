import {useEffect, useMemo, useSyncExternalStore} from 'react';
import {projectStatsUrl, validProjectStatistics, withProjectStatistics} from '../data/projectStatistics.mjs';

let statistics = null;
let request = null;
let attemptedAt = 0;
const listeners = new Set();
const subscribe = listener => { listeners.add(listener); return () => listeners.delete(listener); };
const snapshot = () => statistics;
const serverSnapshot = () => null;
const refreshInterval = 15 * 60 * 1000;

async function refreshStatistics() {
  if (request || Date.now() - attemptedAt < 5 * 60 * 1000) return request;
  attemptedAt = Date.now();
  request = (async () => {
    const response = await fetch(projectStatsUrl, {cache: 'no-cache', credentials: 'omit', signal: AbortSignal.timeout(10000)});
    if (!response.ok) throw new Error('Statistics unavailable');
    const value = await response.json();
    if (!validProjectStatistics(value)) throw new Error('Invalid statistics');
    statistics = value;
    listeners.forEach(listener => listener());
  })().catch(() => {
    // Keep the built-in snapshot (or last successful refresh) on network errors.
  }).finally(() => { request = null; });
  return request;
}

function useStatistics() {
  const value = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  useEffect(() => {
    refreshStatistics();
    const timer = window.setInterval(refreshStatistics, refreshInterval);
    window.addEventListener('focus', refreshStatistics);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refreshStatistics); };
  }, []);
  return value;
}

export function useLiveProject(project) {
  const value = useStatistics();
  return useMemo(() => withProjectStatistics(project, value), [project, value]);
}

export function useLiveProjects(projects) {
  const value = useStatistics();
  return useMemo(() => value ? projects.map(project => withProjectStatistics(project, value)) : projects, [projects, value]);
}
