export type UrgencyLevel = "critical" | "urgent" | "upcoming" | "later" | "expired" | "no_deadline";

export interface DeadlineUrgencyResult {
  status: "expired" | "due_today" | "due_tomorrow" | "due_this_week" | "upcoming" | "no_deadline";
  urgencyLevel: UrgencyLevel;
  tierLabel: "CRITICAL" | "URGENT" | "UPCOMING" | "LATER" | "CLOSED" | "NO DEADLINE";
  label: string;
  countdownText: string;
  formattedDeadline: string;
  daysLeft: number | null;
  hoursLeft: number | null;
  isClosingSoon: boolean;
  isCritical: boolean;
  isExpired: boolean;
}

/**
 * Deterministic helper to calculate deadline urgency status, tiers, countdowns & days remaining.
 */
export function getDeadlineUrgency(deadlineStr?: string): DeadlineUrgencyResult {
  if (!deadlineStr) {
    return {
      status: "no_deadline",
      urgencyLevel: "no_deadline",
      tierLabel: "NO DEADLINE",
      label: "No Deadline",
      countdownText: "No deadline",
      formattedDeadline: "Open Admission",
      daysLeft: null,
      hoursLeft: null,
      isClosingSoon: false,
      isCritical: false,
      isExpired: false,
    };
  }

  const now = new Date();
  const deadline = new Date(deadlineStr);
  const diffMs = deadline.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const formattedTime = deadline.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const formattedDate = deadline.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  if (diffMs < 0) {
    return {
      status: "expired",
      urgencyLevel: "expired",
      tierLabel: "CLOSED",
      label: "Deadline passed",
      countdownText: "Deadline passed",
      formattedDeadline: `${formattedDate} · ${formattedTime}`,
      daysLeft: diffDays,
      hoursLeft: diffHours,
      isClosingSoon: false,
      isCritical: false,
      isExpired: true,
    };
  }

  const isToday =
    deadline.getDate() === now.getDate() &&
    deadline.getMonth() === now.getMonth() &&
    deadline.getFullYear() === now.getFullYear();

  if (isToday || (diffHours >= 0 && diffHours < 24)) {
    const hoursText = diffHours <= 1 ? "in < 1 hour" : `in ${diffHours} hours`;
    return {
      status: "due_today",
      urgencyLevel: "critical",
      tierLabel: "CRITICAL",
      label: "Due today",
      countdownText: diffHours < 12 ? `Closes ${hoursText}` : "Due today",
      formattedDeadline: `Today · ${formattedTime}`,
      daysLeft: 0,
      hoursLeft: Math.max(0, diffHours),
      isClosingSoon: true,
      isCritical: true,
      isExpired: false,
    };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    deadline.getDate() === tomorrow.getDate() &&
    deadline.getMonth() === tomorrow.getMonth() &&
    deadline.getFullYear() === tomorrow.getFullYear();

  if (isTomorrow || (diffHours >= 24 && diffHours < 48)) {
    return {
      status: "due_tomorrow",
      urgencyLevel: "urgent",
      tierLabel: "URGENT",
      label: "Due tomorrow",
      countdownText: "Tomorrow",
      formattedDeadline: `Tomorrow · ${formattedTime}`,
      daysLeft: 1,
      hoursLeft: diffHours,
      isClosingSoon: true,
      isCritical: false,
      isExpired: false,
    };
  }

  if (diffDays <= 7) {
    return {
      status: "due_this_week",
      urgencyLevel: "upcoming",
      tierLabel: "UPCOMING",
      label: `Due in ${diffDays} days`,
      countdownText: `${diffDays} days left`,
      formattedDeadline: `${formattedDate} · ${formattedTime}`,
      daysLeft: diffDays,
      hoursLeft: diffHours,
      isClosingSoon: diffDays <= 3,
      isCritical: false,
      isExpired: false,
    };
  }

  return {
    status: "upcoming",
    urgencyLevel: "later",
    tierLabel: "LATER",
    label: `Closes ${formattedDate}`,
    countdownText: `${diffDays} days left`,
    formattedDeadline: `${formattedDate} · ${formattedTime}`,
    daysLeft: diffDays,
    hoursLeft: diffHours,
    isClosingSoon: false,
    isCritical: false,
    isExpired: false,
  };
}
