export interface Task {
  id: string;
  type: string;
  datetime: Date;
  clientId: string;
  clientName: string;
  recurring: boolean;
  recurringDays: boolean[];
  videoUrl?: string;
  enabled: boolean;
}

export const TASK_TYPES = ["Med Reminders", "Vitals Check", "House Keeping"];

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
