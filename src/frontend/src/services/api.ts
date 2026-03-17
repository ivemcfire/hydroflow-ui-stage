// File: src/frontend/src/services/api.ts
const API_BASE = '/api';

export const fetchSystemStatus = async () => {
  const response = await fetch(`${API_BASE}/status`);
  if (!response.ok) throw new Error('Failed to fetch system status');
  return response.json();
};

export const fetchAnalyticsData = async (graphId: number) => {
  const response = await fetch(`${API_BASE}/analytics/${graphId}`);
  if (!response.ok) throw new Error('Failed to fetch analytics data');
  return response.json();
};

export const fetchHardware = async () => {
  const response = await fetch(`${API_BASE}/hardware`);
  if (!response.ok) throw new Error('Failed to fetch hardware');
  return response.json();
};

export const fetchAutomations = async () => {
  const response = await fetch(`${API_BASE}/automations`);
  if (!response.ok) throw new Error('Failed to fetch automations');
  return response.json();
};

export const fetchPumps = async () => {
  const response = await fetch(`${API_BASE}/pumps`);
  if (!response.ok) throw new Error('Failed to fetch pumps');
  return response.json();
};

export const togglePump = async (id: string) => {
  const response = await fetch(`${API_BASE}/pumps/${id}/toggle`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to toggle pump');
  return response.json();
};

export const fetchActivityLogs = async () => {
  const response = await fetch(`${API_BASE}/activity`);
  if (!response.ok) throw new Error('Failed to fetch activity logs');
  return response.json();
};

export const fetchNotifications = async () => {
  const response = await fetch(`${API_BASE}/alerts`);
  if (!response.ok) throw new Error('Failed to fetch notifications');
  return response.json();
};

export const markNotificationRead = async (id: string) => {
  const response = await fetch(`${API_BASE}/alerts/${id}/read`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to mark notification read');
  return response.json();
};

export const markAllNotificationsRead = async () => {
  const response = await fetch(`${API_BASE}/alerts/read-all`, { method: 'POST' });
  if (!response.ok) throw new Error('Failed to mark all notifications read');
  return response.json();
};

// Node APIs
export const fetchNodes = async () => {
  const response = await fetch(`${API_BASE}/nodes`);
  if (!response.ok) throw new Error('Failed to fetch nodes');
  return response.json();
};

export const createNode = async (nodeData: any) => {
  const response = await fetch(`${API_BASE}/nodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nodeData)
  });
  if (!response.ok) throw new Error('Failed to create node');
  return response.json();
};

export const updateNode = async (id: string, nodeData: any) => {
  const response = await fetch(`${API_BASE}/nodes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nodeData)
  });
  if (!response.ok) throw new Error('Failed to update node');
  return response.json();
};

export const deleteNode = async (id: string) => {
  const response = await fetch(`${API_BASE}/nodes/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete node');
  return response.json();
};

// Rule APIs
export const fetchNodeRules = async (nodeId: string) => {
  const response = await fetch(`${API_BASE}/nodes/${nodeId}/rules`);
  if (!response.ok) throw new Error('Failed to fetch rules');
  return response.json();
};

export const createNodeRule = async (nodeId: string, ruleData: any) => {
  const response = await fetch(`${API_BASE}/nodes/${nodeId}/rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ruleData)
  });
  if (!response.ok) throw new Error('Failed to create rule');
  return response.json();
};

export const deleteNodeRule = async (ruleId: string) => {
  const response = await fetch(`${API_BASE}/rules/${ruleId}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete rule');
  return response.json();
};
