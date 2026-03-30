'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Textarea, FormField } from '@/components/ui';
import {
  useApproveShowcaseProject,
  useRejectShowcaseProject,
  useToggleFeatured,
  useAdminArchiveShowcaseProject,
  useAdminDeleteShowcaseProject,
  type ShowcaseProject,
} from '@/hooks/queries/showcase';

interface Props {
  project: ShowcaseProject;
}

export function ReviewActions({ project }: Props) {
  const router = useRouter();
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');

  const { mutateAsync: approve,  isPending: approving  } = useApproveShowcaseProject();
  const { mutateAsync: reject,   isPending: rejecting   } = useRejectShowcaseProject();
  const { mutateAsync: feature,  isPending: featuring   } = useToggleFeatured();
  const { mutateAsync: archive,  isPending: archiving   } = useAdminArchiveShowcaseProject();
  const { mutateAsync: del,      isPending: deleting    } = useAdminDeleteShowcaseProject();

  const handleApprove = async () => {
    try {
      await approve(project.id);
      toast.success('Project approved');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) { toast.error('Rejection reason is required'); return; }
    try {
      await reject({ id: project.id, reason: reason.trim() });
      toast.success('Project rejected');
      setShowRejectForm(false);
      setReason('');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleFeature = async () => {
    try {
      await feature(project.id);
      toast.success(project.featuredAt ? 'Removed from featured' : 'Marked as featured');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleArchive = async () => {
    if (!confirm('Archive this project? It will be hidden from the public gallery.')) return;
    try {
      await archive(project.id);
      toast.success('Project archived');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project permanently? This removes all images and cannot be undone.')) return;
    try {
      await del(project.id);
      toast.success('Project deleted');
      router.push('/admin/showcase');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {project.status === 'PENDING' && (
        <>
          <Button variant="primary" size="md" loading={approving} onClick={handleApprove} className="w-full">
            Approve
          </Button>

          {!showRejectForm ? (
            <Button variant="danger" size="md" onClick={() => setShowRejectForm(true)} className="w-full">
              Reject
            </Button>
          ) : (
            <div className="flex flex-col gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <FormField label="Rejection reason" required>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this project was rejected…"
                  rows={3}
                />
              </FormField>
              <div className="flex gap-2">
                <Button variant="danger" size="sm" loading={rejecting} onClick={handleReject} className="flex-1">
                  Confirm Reject
                </Button>
                <Button variant="secondary" size="sm" onClick={() => { setShowRejectForm(false); setReason(''); }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {project.status === 'APPROVED' && (
        <Button variant="secondary" size="md" loading={featuring} onClick={handleFeature} className="w-full">
          {project.featuredAt ? 'Remove Featured' : 'Mark as Featured'}
        </Button>
      )}

      {project.status !== 'ARCHIVED' && (
        <Button variant="secondary" size="md" loading={archiving} onClick={handleArchive} className="w-full">
          Archive Project
        </Button>
      )}

      <Button variant="danger" size="md" loading={deleting} onClick={handleDelete} className="w-full">
        Delete Project
      </Button>
    </div>
  );
}
