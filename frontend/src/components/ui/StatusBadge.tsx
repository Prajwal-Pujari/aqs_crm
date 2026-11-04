import { clsx } from 'clsx';

type StatusVariant =
  | 'ACTIVE'
  | 'RENEWAL_DUE'
  | 'OVERDUE'
  | 'LAPSED'
  | 'IN_TALKS'
  | 'LEAD'
  | 'DEMO'
  | 'QUOTATION_SENT'
  | 'PO_RECEIVED'
  | 'INSTALLATION'
  | 'LIVE'
  | 'RENEWED'
  | 'CONTACTED'
  | 'QUALIFIED'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'CLOSED_WON'
  | 'CLOSED_LOST';

interface StatusBadgeProps {
  status?: StatusVariant | string;
  stage?: StatusVariant | string;
  className?: string;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  // Cycle statuses
  ACTIVE: { bg: 'bg-[#E4EDE8]', text: 'text-[#446254]', label: 'Active' },
  RENEWAL_DUE: { bg: 'bg-[#F6E9D6]', text: 'text-[#C98F4F]', label: 'Renewal Due' },
  OVERDUE: { bg: 'bg-[#F5E1DC]', text: 'text-[#BC6A5C]', label: 'Overdue' },
  LAPSED: { bg: 'bg-[#EAE6DF]', text: 'text-[#9A948B]', label: 'Lapsed' },
  RENEWED: { bg: 'bg-[#E4EDE8]', text: 'text-[#446254]', label: 'Renewed' },
  
  // Pipeline stages
  LEAD: { bg: 'bg-[#E1EAF1]', text: 'text-[#7C97AE]', label: 'Lead' },
  IN_TALKS: { bg: 'bg-[#E1EAF1]', text: 'text-[#7C97AE]', label: 'In Talks' },
  DEMO: { bg: 'bg-[#E1EAF1]', text: 'text-[#5A8CA8]', label: 'Demo' },
  QUOTATION_SENT: { bg: 'bg-[#F6E9D6]', text: 'text-[#C98F4F]', label: 'Quotation Sent' },
  PO_RECEIVED: { bg: 'bg-[#E4EDE8]', text: 'text-[#5F7F70]', label: 'PO Received' },
  INSTALLATION: { bg: 'bg-[#F6E9D6]', text: 'text-[#B87A38]', label: 'Installation' },
  LIVE: { bg: 'bg-[#E4EDE8]', text: 'text-[#446254]', label: 'Live' },
  CONTACTED: { bg: 'bg-[#E4EDE8]', text: 'text-[#6F8F7F]', label: 'Contacted' },
  QUALIFIED: { bg: 'bg-[#E4EDE8]', text: 'text-[#5F7F70]', label: 'Qualified' },
  PROPOSAL_SENT: { bg: 'bg-[#F6E9D6]', text: 'text-[#C98F4F]', label: 'Proposal Sent' },
  NEGOTIATION: { bg: 'bg-[#F6E9D6]', text: 'text-[#C98F4F]', label: 'Negotiation' },
  CLOSED_WON: { bg: 'bg-[#E4EDE8]', text: 'text-[#446254]', label: 'Closed Won' },
  CLOSED_LOST: { bg: 'bg-[#F5E1DC]', text: 'text-[#BC6A5C]', label: 'Closed Lost' },
};

const defaultStyle = { bg: 'bg-[#EAE6DF]', text: 'text-[#9A948B]', label: 'Unknown' };

export default function StatusBadge({ status, stage, className }: StatusBadgeProps) {
  const currentKey = status || stage || 'UNKNOWN';
  const style = statusStyles[currentKey] ?? {
    bg: 'bg-[#EAE6DF]',
    text: 'text-[#9A948B]',
    label: currentKey.replace(/_/g, ' '),
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-pill px-2.5 py-0.5 font-body text-label-sm font-semibold',
        style.bg,
        style.text,
        className,
      )}
    >
      {style.label}
    </span>
  );
}
