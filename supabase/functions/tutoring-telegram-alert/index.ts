Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const expectedSecret = Deno.env.get('WEBHOOK_SECRET');
  const receivedSecret = req.headers.get('x-webhook-secret') ?? '';

  if (!expectedSecret) {
    return json({ error: 'Missing WEBHOOK_SECRET' }, 500);
  }

  if (receivedSecret !== expectedSecret) {
    return json({ error: 'Unauthorized webhook request' }, 401);
  }

  const telegramToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const telegramChatId = Deno.env.get('TELEGRAM_CHAT_ID');

  if (!telegramToken || !telegramChatId) {
    return json({ error: 'Missing Telegram secrets' }, 500);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const row = extractInquiryRow(payload);
  if (!row) {
    return json({ error: 'No inquiry record found in webhook body' }, 400);
  }

  const text = buildTelegramMessage(row);
  const telegramResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: telegramChatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });

  const telegramJson = await telegramResponse.json().catch(() => null);

  if (!telegramResponse.ok) {
    return json(
      {
        error: 'Telegram send failed',
        telegram_status: telegramResponse.status,
        telegram_response: telegramJson
      },
      502
    );
  }

  return json({ ok: true, telegram_response: telegramJson });
});

type InquiryRow = {
  id?: string;
  created_at?: string;
  parent_name?: string;
  email?: string | null;
  phone?: string | null;
  student_level?: string;
  course?: string;
  preferred_format?: string | null;
  goal?: string;
  details?: string | null;
  status?: string;
  source?: string;
};

function extractInquiryRow(payload: Record<string, unknown>): InquiryRow | null {
  const candidates = [
    payload.record,
    payload.new,
    payload,
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'object') continue;
    const row = candidate as Record<string, unknown>;
    if ('parent_name' in row && 'course' in row && 'goal' in row) {
      return row as InquiryRow;
    }
  }

  return null;
}

function buildTelegramMessage(row: InquiryRow): string {
  const lines = [
    '📬 <b>New tutoring inquiry</b>',
    '',
    field('Name', row.parent_name),
    field('Student level', row.student_level),
    field('Course', row.course),
    field('Preferred format', row.preferred_format ?? 'Not provided'),
    field('Email', row.email ?? 'Not provided'),
    field('Phone', row.phone ?? 'Not provided'),
    field('Goal', row.goal),
    field('Details', row.details ?? 'Not provided'),
    field('Status', row.status ?? 'new'),
    field('Source', row.source ?? 'website'),
    field('Submitted at', row.created_at ?? new Date().toISOString()),
  ];

  if (row.id) {
    lines.push(field('Inquiry ID', row.id));
  }

  return lines.join('\n');
}

function field(label: string, value?: string | null): string {
  return `<b>${escapeHtml(label)}:</b> ${escapeHtml(value ?? 'Not provided')}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  });
}
