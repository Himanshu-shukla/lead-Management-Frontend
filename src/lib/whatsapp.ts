import type { Lead } from '../types';

export const normalizeWhatsAppNumber = (value?: string | number | null) => {
  const rawValue = value == null ? '' : String(value);
  const digits = rawValue.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (digits.startsWith('44')) {
    return digits;
  }

  if (digits.startsWith('0')) {
    return `44${digits.slice(1)}`;
  }

  return `44${digits}`;
};

export const getLeadWhatsAppNumber = (lead: Lead) => {
  const preferredNumber = lead.whatsapp ?? lead.phone ?? '';
  return normalizeWhatsAppNumber(preferredNumber);
};

export const formatWhatsAppLeadName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export const buildWhatsAppMessage = (lead: Lead) =>
  `Hi ${formatWhatsAppLeadName(lead.name)}, Hope you are doing well. I'm reaching out regarding your inquiry on Data Analytics and Gen AI Training program

Regards
Brit Institute`;

export const buildWhatsAppUrl = (lead: Lead, message: string) => {
  const phoneNumber = getLeadWhatsAppNumber(lead);

  if (!phoneNumber) {
    return '';
  }

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message.trim())}`;
};
