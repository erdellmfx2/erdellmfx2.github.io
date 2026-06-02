(function () {
  const form = document.getElementById('tutoring-intake-form');
  const preview = document.getElementById('message-preview');
  const status = document.getElementById('status-note');
  if (!form || !preview || !status) return;

  const submitButton = form.querySelector('button[type="submit"]');
  if (!submitButton) return;

  function getSupabaseConfig() {
    if (!window.TUTORING_CAPITAL_SUPABASE) return null;

    const { url, anonKey } = window.TUTORING_CAPITAL_SUPABASE;
    if (!url || !anonKey) return null;

    return {
      url: url.replace(/\/$/, ''),
      anonKey
    };
  }

  function optionalValue(value) {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  function buildMessage() {
    const data = new FormData(form);
    const lines = [
      'Hello Dr. Maurice,',
      '',
      'I would like to request a tutoring consultation through Tutoring Capital.',
      '',
      'Parent or student name: ' + (data.get('parentName') || ''),
      'Email: ' + (data.get('email') || ''),
      'Phone: ' + (data.get('phone') || ''),
      'Student level: ' + (data.get('studentLevel') || ''),
      'Course or subject: ' + (data.get('course') || ''),
      'Preferred format: ' + (data.get('format') || ''),
      '',
      'Main goal:',
      data.get('goal') || '',
      '',
      'Additional details:',
      data.get('details') || '',
      '',
      'Thank you.'
    ];
    return lines.join('\n');
  }

  function buildPayload() {
    const data = new FormData(form);
    return {
      parent_name: (data.get('parentName') || '').trim(),
      email: (data.get('email') || '').trim(),
      phone: optionalValue(data.get('phone')),
      student_level: (data.get('studentLevel') || '').trim(),
      course: (data.get('course') || '').trim(),
      preferred_format: optionalValue(data.get('format')),
      goal: (data.get('goal') || '').trim(),
      details: optionalValue(data.get('details')),
      source: 'website',
      honeypot: (data.get('website') || '').trim()
    };
  }

  async function submitToSupabase(payload) {
    const config = getSupabaseConfig();
    if (!config) return { ok: false, fallback: true };

    const response = await fetch(config.url + '/rest/v1/tutoring_inquiries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.anonKey,
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Supabase insert failed (' + response.status + '): ' + (errorText || 'No error body returned'));
    }

    return { ok: true };
  }

  function updatePreview() {
    preview.value = buildMessage();
  }

  function hasContactMethod(payload) {
    return Boolean(payload.email || payload.phone);
  }

  form.addEventListener('input', updatePreview);
  updatePreview();

  form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const payload = buildPayload();
    if (!hasContactMethod(payload)) {
      status.textContent = 'Please provide at least an email address or a phone number before submitting.';
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    status.textContent = '';

    try {
      const result = await submitToSupabase(payload);
      const subject = encodeURIComponent('Tutoring Capital Consultation Request');
      const body = encodeURIComponent(buildMessage());

      if (result.fallback) {
        window.location.href = 'mailto:erdell.maurice@famu.edu?subject=' + subject + '&body=' + body;
        status.textContent = 'Supabase is not configured yet, so your email app should open with a prepared tutoring request. After you add your Supabase project details, this form will also save submissions to the database.';
      } else {
        form.reset();
        updatePreview();
        status.textContent = 'Your tutoring request was saved successfully. You can still email or call if you want to follow up right away.';
      }
    } catch (error) {
      const subject = encodeURIComponent('Tutoring Capital Consultation Request');
      const body = encodeURIComponent(buildMessage());
      status.textContent = 'The database submission did not complete. Error: ' + error.message + ' You can use the email fallback if needed.';
      window.location.href = 'mailto:erdell.maurice@famu.edu?subject=' + subject + '&body=' + body;
      console.error(error);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send Tutoring Request';
    }
  });
})();
