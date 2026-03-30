import { Badge } from '@/components/ui';
import type { ShowcaseStatus } from '@/hooks/queries/showcase';

interface Props {
  status: ShowcaseStatus;
  size?: 'sm' | 'md';
}

const CONFIG: Record<ShowcaseStatus, { variant: 'warning' | 'success' | 'danger' | 'default'; label: string }> = {
  PENDING:  { variant: 'warning', label: 'Pending Review' },
  APPROVED: { variant: 'success', label: 'Approved' },
  REJECTED: { variant: 'danger',  label: 'Rejected' },
  ARCHIVED: { variant: 'default', label: 'Archived' },
};

export function StatusBadge({ status, size = 'sm' }: Props) {
  const { variant, label } = CONFIG[status];
  return <Badge variant={variant} size={size}>{label}</Badge>;
}
