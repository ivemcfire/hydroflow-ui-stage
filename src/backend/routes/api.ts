// File: src/backend/routes/api.ts
import { Router } from 'express';
import { getPumps, togglePump } from '../controllers/pumpController';
import { getActivityLogs } from '../controllers/activityController';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { getNodes, createNode, updateNode, deleteNode, getNodeRules, createRule, deleteRule } from '../controllers/nodeController';
import { getSystemHealth } from '../controllers/systemHealthController';
import { getAnalyticsData, getSensorLogs } from '../controllers/analyticsController';
import { getComponents, updateComponent, addComponent, deleteComponent, getAutomations } from '../controllers/hardwareController';

const router = Router();

router.get('/status', getSystemHealth);

router.get('/analytics/:graphId', getAnalyticsData);
router.get('/sensors/logs', getSensorLogs);

router.get('/hardware', getComponents);
router.post('/hardware', addComponent);
router.put('/hardware/:id', updateComponent);
router.delete('/hardware/:id', deleteComponent);

router.get('/automations', getAutomations);

router.get('/pumps', getPumps);
router.post('/pumps/:id/toggle', togglePump);
router.get('/activity', getActivityLogs);

router.get('/alerts', getNotifications);
router.post('/alerts/:id/read', markAsRead);
router.post('/alerts/read-all', markAllAsRead);

router.get('/nodes', getNodes);
router.post('/nodes', createNode);
router.put('/nodes/:id', updateNode);
router.delete('/nodes/:id', deleteNode);

router.get('/nodes/:nodeId/rules', getNodeRules);
router.post('/nodes/:nodeId/rules', createRule);
router.delete('/rules/:id', deleteRule);

export default router;
