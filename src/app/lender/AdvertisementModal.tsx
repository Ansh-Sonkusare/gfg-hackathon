'use client';

import { useState } from 'react';
import { trpc } from '../../utils/trpc';
import { toast } from 'sonner';

interface AdvertisementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdvertisementModal({ isOpen, onClose, onSuccess }: AdvertisementModalProps) {
  const [formData, setFormData] = useState({
    minAmount: '',
    maxAmount: '',
    interestRate: '',
    minDuration: '',
    maxDuration: '',
    riskTolerance: 'Medium',
    targetAudience: 'All Students'
  });

   const createAdMutation = trpc.advertisement.createAdvertisement.useMutation({
     onSuccess: () => {
       onSuccess();
       onClose();
       setFormData({
         minAmount: '',
         maxAmount: '',
         interestRate: '',
         minDuration: '',
         maxDuration: '',
         riskTolerance: 'Medium',
         targetAudience: 'All Students'
       });
     },
     onError: (error) => {
       toast.error(error.message);
     }
   });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      minAmount: parseInt(formData.minAmount),
      maxAmount: parseInt(formData.maxAmount),
      interestRate: parseFloat(formData.interestRate),
      minDuration: parseInt(formData.minDuration),
      maxDuration: parseInt(formData.maxDuration),
      riskTolerance: formData.riskTolerance,
      targetAudience: formData.targetAudience
    };

    createAdMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Lending Advertisement</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">


            <div className="form-row">
              <div className="form-group">
                <label>Min Amount (₹)</label>
                <input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({...formData, minAmount: e.target.value})}
                  min="100"
                  max="50000"
                  required
                />
              </div>
              <div className="form-group">
                <label>Max Amount (₹)</label>
                <input
                  type="number"
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({...formData, maxAmount: e.target.value})}
                  min="100"
                  max="50000"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Interest Rate (%)</label>
                <input
                  type="number"
                  value={formData.interestRate}
                  onChange={(e) => setFormData({...formData, interestRate: e.target.value})}
                  min="0"
                  max="50"
                  step="0.1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Risk Tolerance</label>
                <select
                  value={formData.riskTolerance}
                  onChange={(e) => setFormData({...formData, riskTolerance: e.target.value})}
                >
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Min Duration (Days)</label>
                <input
                  type="number"
                  value={formData.minDuration}
                  onChange={(e) => setFormData({...formData, minDuration: e.target.value})}
                  min="1"
                  max="365"
                  required
                />
              </div>
              <div className="form-group">
                <label>Max Duration (Days)</label>
                <input
                  type="number"
                  value={formData.maxDuration}
                  onChange={(e) => setFormData({...formData, maxDuration: e.target.value})}
                  min="1"
                  max="365"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Target Audience</label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
              >
                <option value="All Students">All Students</option>
                <option value="College Students">College Students</option>
                <option value="Graduate Students">Graduate Students</option>
                <option value="First Year Students">First Year Students</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={createAdMutation.isPending}>
              {createAdMutation.isPending ? 'Creating...' : 'Create Advertisement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}