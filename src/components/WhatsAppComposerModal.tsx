import React from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, X } from 'lucide-react';
import type { Lead } from '../types';

interface WhatsAppComposerModalProps {
  open: boolean;
  lead: Lead | null;
  message: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onSend: () => void;
}

const WhatsAppComposerModal: React.FC<WhatsAppComposerModalProps> = ({
  open,
  lead,
  message,
  onChange,
  onClose,
  onSend,
}) => {
  if (!open || !lead) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[calc(100vh-3rem)] rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div>
            <p className="text-sm text-gray-500">Send WhatsApp message</p>
            <h3 className="text-xl font-semibold text-gray-900">{lead.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{lead.whatsapp || lead.phone}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close WhatsApp composer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3">
            <p className="text-sm font-medium text-green-900">
              This will open WhatsApp with your message prefilled.
            </p>
            <p className="text-xs text-green-800 mt-1">
              You'll still review and press send inside WhatsApp.
            </p>
          </div>

          <div>
            <label className="form-label">Message</label>
            <textarea
              value={message}
              onChange={(e) => onChange(e.target.value)}
              className="textarea textarea-bordered w-full min-h-40"
              placeholder="Write your custom WhatsApp message..."
            />
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-2">
              Preview
            </p>
            <p className="whitespace-pre-wrap text-sm text-gray-700 leading-6">
              {message || 'Your message preview will appear here.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4 bg-gray-50">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
          <button type="button" onClick={onSend} className="btn btn-success">
            <MessageCircle className="w-4 h-4" />
            Open WhatsApp
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WhatsAppComposerModal;
