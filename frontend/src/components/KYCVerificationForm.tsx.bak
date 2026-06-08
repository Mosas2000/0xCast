import { useState } from 'react';
import { reputationFraudIntegration } from '@/services/ReputationFraudIntegrationService';

interface KYCVerificationFormProps {
  userId: string;
  onComplete?: () => void;
}

export function KYCVerificationForm({ userId, onComplete }: KYCVerificationFormProps) {
  const [step, setStep] = useState<'document' | 'address' | 'selfie' | 'review'>('document');
  const [documentType, setDocumentType] = useState<'passport' | 'license' | 'national_id'>('passport');
  const [documentFront, setDocumentFront] = useState<string>('');
  const [documentBack, setDocumentBack] = useState<string>('');
  const [selfie, setSelfie] = useState<string>('');
  const [addressProof, setAddressProof] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleDocumentUpload = (type: 'front' | 'back', file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === 'front') {
        setDocumentFront(base64);
      } else {
        setDocumentBack(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelfieUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelfie(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddressProofUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setAddressProof(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const kycService = reputationFraudIntegration.getKYCAMLService();

      kycService.submitKYC(userId, documentType, {
        documentFront,
        documentBack,
        selfie,
        addressProof,
        address,
      });

      kycService.uploadDocument(userId, documentType, documentFront, documentBack, selfie);
      
      if (addressProof && address) {
        kycService.uploadAddressProof(userId, 'utility_bill', addressProof, address);
      }

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to submit KYC');
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderDocumentStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
        Document Verification
      </h3>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Document Type
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value as any)}
          className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
        >
          <option value="passport">Passport</option>
          <option value="license">Driver's License</option>
          <option value="national_id">National ID</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Document Front
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && handleDocumentUpload('front', e.target.files[0])}
          className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
        />
        {documentFront && (
          <div className="mt-2 text-sm text-green-500">Document uploaded</div>
        )}
      </div>

      {documentType !== 'passport' && (
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Document Back
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleDocumentUpload('back', e.target.files[0])}
            className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
          />
          {documentBack && (
            <div className="mt-2 text-sm text-green-500">Document uploaded</div>
          )}
        </div>
      )}

      <button
        onClick={() => setStep('address')}
        disabled={!documentFront || (documentType !== 'passport' && !documentBack)}
        className="w-full px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
      >
        Next
      </button>
    </div>
  );

  const renderAddressStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
        Address Verification
      </h3>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Residential Address
        </label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
          className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
          placeholder="Enter your full address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Proof of Address (Utility Bill, Bank Statement, etc.)
        </label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => e.target.files && handleAddressProofUpload(e.target.files[0])}
          className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
        />
        {addressProof && (
          <div className="mt-2 text-sm text-green-500">Proof uploaded</div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setStep('document')}
          className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setStep('selfie')}
          disabled={!address || !addressProof}
          className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );

  const renderSelfieStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
        Selfie Verification
      </h3>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-400">
        Please upload a clear selfie holding your ID document next to your face
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Selfie with ID
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && handleSelfieUpload(e.target.files[0])}
          className="w-full px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
        />
        {selfie && (
          <div className="mt-2 text-sm text-green-500">Selfie uploaded</div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setStep('address')}
          className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setStep('review')}
          disabled={!selfie}
          className="flex-1 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
        >
          Review
        </button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
        Review & Submit
      </h3>

      <div className="space-y-3">
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Document Type</div>
          <div className="font-medium text-neutral-900 dark:text-white capitalize">
            {documentType.replace('_', ' ')}
          </div>
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Address</div>
          <div className="font-medium text-neutral-900 dark:text-white">
            {address}
          </div>
        </div>

        <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">Documents</div>
          <div className="text-sm text-green-500">
            All required documents uploaded
          </div>
        </div>
      </div>

      {error && (
        <div 
          id="kyc-error"
          role="alert"
          className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => setStep('selfie')}
          disabled={loading}
          className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Submitting...' : 'Submit KYC'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-800">
      <div className="mb-6">
        <div className="flex justify-between mb-2">
          {['document', 'address', 'selfie', 'review'].map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded ${
                ['document', 'address', 'selfie', 'review'].indexOf(step) >= i
                  ? 'bg-blue-500'
                  : 'bg-neutral-200 dark:bg-neutral-700'
              } ${i > 0 ? 'ml-2' : ''}`}
            />
          ))}
        </div>
        <div className="text-sm text-neutral-600 dark:text-neutral-400 capitalize">
          Step {['document', 'address', 'selfie', 'review'].indexOf(step) + 1} of 4: {step}
        </div>
      </div>

      {step === 'document' && renderDocumentStep()}
      {step === 'address' && renderAddressStep()}
      {step === 'selfie' && renderSelfieStep()}
      {step === 'review' && renderReviewStep()}
    </div>
  );
}
