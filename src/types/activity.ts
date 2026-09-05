import type { ID, Timestamp } from './common';

export type ActivityAction = 'analyzed' | 'created' | 'updated' | 'completed' | 'generated' | 'reviewed';

export interface ActivityEvent {
  id: ID;
  action: ActivityAction;
  entity: string;
  description: string;
  timestamp: Timestamp;
  icon: string; // lucide icon name
  metadata: Record<string, unknown> | null;
}