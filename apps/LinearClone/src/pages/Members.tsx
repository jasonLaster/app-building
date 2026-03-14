import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { fetchMembers, inviteMember, updateMemberRole, removeMember } from '../slices/membersSlice';
import MemberList from '../components/MemberList';
import InviteMemberModal from '../components/InviteMemberModal';
import './Members.css';

export default function Members() {
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const { items: members, currentUserId, loading } = useSelector((state: RootState) => state.members);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => {
    if (token) {
      dispatch(fetchMembers());
    }
  }, [dispatch, token]);

  const adminCount = members.filter((m) => m.role === 'admin').length;

  async function handleInvite(email: string) {
    const result = await dispatch(inviteMember(email));
    if (inviteMember.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
    setInviteModalOpen(false);
  }

  async function handleChangeRole(memberId: string, role: string) {
    await dispatch(updateMemberRole({ memberId, role })).unwrap();
  }

  async function handleRemove(memberId: string) {
    await dispatch(removeMember(memberId)).unwrap();
  }

  return (
    <div className="members-page" data-testid="members-page">
      <div className="members-header">
        <h1 className="members-title" data-testid="members-title">Members</h1>
        <button
          className="members-invite-btn"
          onClick={() => setInviteModalOpen(true)}
          data-testid="invite-member-btn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Invite Member
        </button>
      </div>

      {loading ? (
        <div className="members-loading" data-testid="members-loading">
          Loading...
        </div>
      ) : (
        <MemberList
          members={members}
          currentUserId={currentUserId}
          adminCount={adminCount}
          onChangeRole={handleChangeRole}
          onRemove={handleRemove}
        />
      )}

      <InviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSubmit={handleInvite}
      />
    </div>
  );
}
