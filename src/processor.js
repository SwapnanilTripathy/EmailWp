import { config } from './config.js';
import { getMessage, listNewMessageIds } from './gmail.js';
import { formatEmail, sendWhatsAppText } from './whatsapp.js';
import { loadState, saveState } from './store.js';

function matchesFilter(email) {
  if (!config.filterTerms.length) return true;
  const haystack = `${email.from} ${email.subject} ${email.body}`.toLowerCase();
  return config.filterTerms.some(term => haystack.includes(term.toLowerCase()));
}

let running = false;

export async function checkInbox() {
  if (running) return { skipped: true };
  running = true;
  try {
    const state = await loadState();
    const ids = await listNewMessageIds(state.lastCheckedAt);
    const newIds = ids.filter(id => !state.processedIds.includes(id));
    let forwarded = 0;

    for (const id of newIds.reverse()) {
      const email = await getMessage(id);
      state.processedIds.push(id);
      state.lastCheckedAt = Math.max(state.lastCheckedAt, email.internalDate);

      if (!matchesFilter(email)) continue;

      try {
        await sendWhatsAppText(formatEmail(email));
        forwarded++;
      } catch (error) {
        console.error(`Failed to forward ${id}:`, error.message);
      }
    }

    state.lastCheckedAt = Math.max(state.lastCheckedAt, Date.now());
    await saveState(state);
    return { checked: newIds.length, forwarded };
  } finally {
    running = false;
  }
}
