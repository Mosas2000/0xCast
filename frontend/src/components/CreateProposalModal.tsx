/**
 * CreateProposalModal Component
 * 
 * Modal for creating new governance proposals.
 */

import { useState } from 'react';
import { formatVotingPower } from '../hooks/useGovernance';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string) => Promise<void>;
  isSubmitting: boolean;
  userVotingPower: bigint;
  proposalThreshold: bigint;
  error: string | null;
}

export function CreateProposalModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  userVotingPower,
  proposalThreshold,
  error,
}: CreateProposalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const hasEnoughTokens = userVotingPower >= proposalThreshold;
  const titleLength = title.trim().length;
  const descriptionLength = description.trim().length;
  const isTitleValid = titleLength > 0 && titleLength <= 256;
  const isDescriptionValid = descriptionLength > 0 && descriptionLength <= 1024;
  const canSubmit = hasEnoughTokens && isTitleValid && isDescriptionValid && !isSubmitting;

  const handleSubmit = async () => {
    setValidationError(null);

    if (!hasEnoughTokens) {
      setValidationError(`You need at least ${formatVotingPower(proposalThreshold)} CAST tokens to create a proposal`);
      return;
    }

    if (!isTitleValid) {
      setValidationError('Title must be between 1 and 256 characters');
      return;
    }

    if (!isDescriptionValid) {
      setValidationError('Description must be between 1 and 1024 characters');
      return;
    }

    await onSubmit(title.trim(), description.trim());
    
    // Reset form on success
    if (!error) {
      setTitle('');
      setDescription('');
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setValidationError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#0A0A0A',
          border: '1px solid #2F2F2F',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#9CA3AF',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#FFFFFF',
            marginBottom: '8px',
          }}>
            Create Proposal
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#9CA3AF',
          }}>
            Submit a new governance proposal for the community to vote on
          </p>
        </div>

        {/* Voting Power Check */}
        <div style={{
          padding: '16px',
          backgroundColor: hasEnoughTokens ? '#22C55E10' : '#EF444410',
          border: `1px solid ${hasEnoughTokens ? '#22C55E30' : '#EF444430'}`,
          borderRadius: '12px',
          marginBottom: '24px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ 
                fontSize: '14px', 
                color: '#9CA3AF',
                marginBottom: '4px',
              }}>
                Your Voting Power
              </div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '600',
                color: '#FFFFFF',
              }}>
                {formatVotingPower(userVotingPower)} CAST
              </div>
            </div>
            <div style={{
              textAlign: 'right',
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: '#9CA3AF',
                marginBottom: '4px',
              }}>
                Required to Propose
              </div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: '600',
                color: hasEnoughTokens ? '#22C55E' : '#EF4444',
              }}>
                {formatVotingPower(proposalThreshold)} CAST
              </div>
            </div>
          </div>
          {!hasEnoughTokens && (
            <p style={{
              marginTop: '12px',
              fontSize: '13px',
              color: '#EF4444',
            }}>
              ⚠️ You need more CAST tokens to create a proposal
            </p>
          )}
        </div>

        {/* Form */}
        <div style={{ marginBottom: '24px' }}>
          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#FFFFFF',
              marginBottom: '8px',
            }}>
              Title
              <span style={{ 
                float: 'right', 
                color: titleLength > 256 ? '#EF4444' : '#6B7280',
                fontWeight: '400',
              }}>
                {titleLength}/256
              </span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a clear, descriptive title"
              disabled={!hasEnoughTokens || isSubmitting}
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: '#111111',
                border: '1px solid #2F2F2F',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '15px',
                outline: 'none',
                opacity: !hasEnoughTokens ? 0.5 : 1,
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#FFFFFF',
              marginBottom: '8px',
            }}>
              Description
              <span style={{ 
                float: 'right', 
                color: descriptionLength > 1024 ? '#EF4444' : '#6B7280',
                fontWeight: '400',
              }}>
                {descriptionLength}/1024
              </span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your proposal in detail. What changes do you want to make and why?"
              disabled={!hasEnoughTokens || isSubmitting}
              rows={6}
              style={{
                width: '100%',
                padding: '14px 16px',
                backgroundColor: '#111111',
                border: '1px solid #2F2F2F',
                borderRadius: '10px',
                color: '#FFFFFF',
                fontSize: '15px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                opacity: !hasEnoughTokens ? 0.5 : 1,
              }}
            />
          </div>
        </div>

        {/* Errors */}
        {(error || validationError) && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#EF444420',
            border: '1px solid #EF444440',
            borderRadius: '10px',
            marginBottom: '24px',
            color: '#F87171',
            fontSize: '14px',
          }}>
            {validationError || error}
          </div>
        )}

        {/* Info */}
        <div style={{
          padding: '16px',
          backgroundColor: '#3B82F610',
          border: '1px solid #3B82F630',
          borderRadius: '12px',
          marginBottom: '24px',
        }}>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#60A5FA',
            marginBottom: '8px',
          }}>
            ℹ️ How Proposals Work
          </h4>
          <ul style={{ 
            fontSize: '13px', 
            color: '#9CA3AF',
            paddingLeft: '20px',
            margin: 0,
            lineHeight: '1.6',
          }}>
            <li>Voting begins 10 blocks after proposal creation</li>
            <li>Voting period lasts approximately 10 days</li>
            <li>Proposals need to reach quorum to pass</li>
            <li>Passed proposals enter a 1-day timelock before execution</li>
          </ul>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleClose}
            style={{
              padding: '14px 24px',
              backgroundColor: 'transparent',
              border: '1px solid #374151',
              borderRadius: '10px',
              color: '#9CA3AF',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              padding: '14px 32px',
              backgroundColor: canSubmit ? '#3B82F6' : '#1F2937',
              border: 'none',
              borderRadius: '10px',
              color: canSubmit ? '#FFFFFF' : '#6B7280',
              fontSize: '15px',
              fontWeight: '600',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Proposal'}
          </button>
        </div>
      </div>
    </div>
  );
}
