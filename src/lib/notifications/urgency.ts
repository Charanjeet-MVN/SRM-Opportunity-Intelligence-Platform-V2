/**
 * Deterministic helper to calculate deadline urgency status & days remaining
 */
export function getDeadlineUrgency(deadlineStr?: string): {
  status: "expired" | "due_today" | "due_tomorrow" | "due_this_week" | "upcoming" | "no_deadline";
  label: string;
  daysLeft: number | null;
} {
  if (!deadlineStr) {
    return { status: "no_deadline", label: "No Deadline", daysLeft: null };
  }

  const now = new Date();
  const deadline = new Date(deadlineStr);
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return { status: "expired", label: "Deadline passed", daysLeft: diffDays };
  }

  const isToday =
    deadline.getDate() === now.getDate() &&
    deadline.getMonth() === now.getMonth() &&
    deadline.getFullYear() === now.getFullYear();

  if (isToday) {
    return { status: "due_today", label: "Due today", daysLeft: 0 };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    deadline.getDate() === tomorrow.getDate() &&
    deadline.getMonth() === tomorrow.getMonth() &&
    deadline.getFullYear() === tomorrow.getFullYear();

  if (isTomorrow) {
    return { status: "due_tomorrow", label: "Due tomorrow", daysLeft: 1 };
  }

  if (diffDays <= 7) {
    return { status: "due_this_week", label: `Due in ${diffDays} days`, daysLeft: diffDays };
  }

  return {
    status: "upcoming",
    label: `Closes ${deadline.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
    daysLeft: diffDays,
  };
}
