// File: src/backend/services/automationService.ts
import { db } from '../localDb';
import { publishCommand } from './mqttService';
import { addActivityLog } from '../controllers/activityController';
import { addNotification } from '../controllers/notificationController';

export interface Rule {
  id: string;
  nodeId: string;
  sensor: string;
  condition: '<' | '>' | '=';
  threshold: number;
  action: 'Turn On' | 'Turn Off';
  component: string;
}

// Track last triggered state to avoid spamming commands
const lastTriggeredState: Record<string, string> = {};

/**
 * Evaluates all rules for a given sensor reading
 */
export const evaluateRulesForSensor = async (nodeId: string, sensor: string, value: number) => {
  try {
    // 1. Fetch all nodes to find the rules (rules are in subcollections)
    // In a real app, we might cache these or use a root 'rules' collection
    const nodesSnapshot = await db.collection('nodes').get();
    
    for (const nodeDoc of nodesSnapshot.docs) {
      const rulesSnapshot = await nodeDoc.ref.collection('rules').where('sensor', '==', sensor).get();
      
      for (const ruleDoc of rulesSnapshot.docs) {
        const rule = { id: ruleDoc.id, nodeId: nodeDoc.id, ...ruleDoc.data() } as Rule;
        
        let conditionMet = false;
        switch (rule.condition) {
          case '<':
            conditionMet = value < rule.threshold;
            break;
          case '>':
            conditionMet = value > rule.threshold;
            break;
          case '=':
            conditionMet = Math.abs(value - rule.threshold) < 0.1;
            break;
        }

        if (conditionMet) {
          const stateKey = `${rule.nodeId}_${rule.component}_${rule.action}`;
          const lastState = lastTriggeredState[stateKey];

          // Only trigger if state changed or hasn't been triggered in a while
          // For simplicity, we just check if it's the same action
          if (lastState !== rule.action) {
            console.log(`[AUTOMATION] Rule Triggered: ${sensor} is ${value} ${rule.condition} ${rule.threshold}. Action: ${rule.action} ${rule.component}`);
            
            // Execute Action
            const mqttAction = rule.action === 'Turn On' ? 'ON' : 'OFF';
            publishCommand(rule.nodeId, rule.component, mqttAction);
            
            // Log Activity
            await addActivityLog('info', `Automation: ${rule.action} ${rule.component} triggered by ${sensor} (${value})`);
            
            // Notify if critical
            if (rule.action === 'Turn On' && sensor === 'Soil Moisture') {
              await addNotification('info', `Auto-Irrigation: ${rule.component} started on node ${rule.nodeId}`);
            }

            // Update state
            lastTriggeredState[stateKey] = rule.action;
          }
        } else {
          // Reset state if condition no longer met (optional, depends on logic)
          // For a pump, if moisture is HIGH, we might want a "Turn Off" rule to trigger
        }
      }
    }
  } catch (error) {
    console.error('Error evaluating automation rules:', error);
  }
};
