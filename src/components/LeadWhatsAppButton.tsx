import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Lead } from '../types';
import { buildWhatsAppMessage, buildWhatsAppUrl } from '../lib/whatsapp';
import WhatsAppComposerModal from './WhatsAppComposerModal';

interface LeadWhatsAppButtonProps {
  lead: Lead;
  className?: string;
}

const LeadWhatsAppButton: React.FC<LeadWhatsAppButtonProps> = ({ lead, className = '' }) => {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [message, setMessage] = useState('');
  const displayNumber = lead.whatsapp ?? lead.phone;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    if (!displayNumber) {
      toast.error('No valid WhatsApp or phone number found for this lead');
      return;
    }

    setMessage(buildWhatsAppMessage(lead));
    setIsComposerOpen(true);
  };

  const handleCloseComposer = () => {
    setIsComposerOpen(false);
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      toast.error('Please enter a WhatsApp message');
      return;
    }

    const url = buildWhatsAppUrl(lead, trimmedMessage);

    if (!url) {
      toast.error('No valid WhatsApp or phone number found for this lead');
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    setIsComposerOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-800 ${className}`}
        title="Message via WhatsApp"
        aria-label={`Message ${lead.name} via WhatsApp`}
      >
        <MessageCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
        <span>{displayNumber}</span>
      </button>

      <WhatsAppComposerModal
        open={isComposerOpen}
        lead={lead}
        message={message}
        onChange={setMessage}
        onClose={handleCloseComposer}
        onSend={handleSend}
      />
    </>
  );
};

export default LeadWhatsAppButton;
