import { Contact } from '../types';

export function exportContactsToCsv(contacts: Contact[], filename = 'business_cards_contacts.csv') {
  if (contacts.length === 0) return;

  const headers = [
    'Name',
    'Japanese Name',
    'English Name',
    'Company',
    'Role / Title',
    'Email',
    'Phone',
    'Secondary Phone',
    'Status',
    'Detected Script',
    'Address',
    'Website',
    'Notes',
    'Date Scanned',
  ];

  const escapeCsvField = (val?: string) => {
    if (!val) return '""';
    const text = String(val).replace(/"/g, '""');
    return `"${text}"`;
  };

  const rows = contacts.map((c) => [
    escapeCsvField(c.name),
    escapeCsvField(c.nameJapanese),
    escapeCsvField(c.nameEnglish),
    escapeCsvField(c.company),
    escapeCsvField(c.role),
    escapeCsvField(c.email),
    escapeCsvField(c.phone),
    escapeCsvField(c.secondaryPhone),
    escapeCsvField(c.status),
    escapeCsvField(c.detectedScript),
    escapeCsvField(c.address),
    escapeCsvField(c.website),
    escapeCsvField(c.notes),
    escapeCsvField(new Date(c.createdAt).toLocaleDateString()),
  ]);

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) which instructs Excel to render Japanese Kanji/Kana properly
  const csvString = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportContactToVCard(contact: Contact) {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${contact.name}`,
    contact.company ? `ORG:${contact.company}` : '',
    contact.role ? `TITLE:${contact.role}` : '',
    contact.email ? `EMAIL;TYPE=WORK,INTERNET:${contact.email}` : '',
    contact.phone ? `TEL;TYPE=WORK,VOICE:${contact.phone}` : '',
    contact.secondaryPhone ? `TEL;TYPE=CELL:${contact.secondaryPhone}` : '',
    contact.address ? `ADR;TYPE=WORK:;;${contact.address};;;;` : '',
    contact.website ? `URL:${contact.website}` : '',
    contact.notes ? `NOTE:${contact.notes}` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n');

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = (contact.nameEnglish || contact.name || 'contact').replace(/[^a-zA-Z0-9_\u4e00-\u9fa5]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `${safeName}.vcf`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
