const $ = selector => document.querySelector(selector);
let user = null;
function message(text, kind = '') { const el = $('#message'); el.textContent = text; el.className = kind; }
function showDiagnosis(record) {
  const d = record.diagnosis;
  $('#result').classList.remove('hidden');
  $('#result').innerHTML = `<span class="pill">${Math.round(d.confidence * 100)}% confidence · ${escapeHtml(d.osiLayer)}</span><h3>${escapeHtml(d.cause)}</h3><p>${escapeHtml(d.evidence)}</p><p><strong>Next command:</strong> <code>${escapeHtml(d.nextCommand)}</code></p><strong>Suggested steps</strong><ol>${d.steps.map(step => `<li>${escapeHtml(step)}</li>`).join('')}</ol><p class="muted">Review status: ${escapeHtml(record.review.status)}</p>`;
}
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
$('#auth-form').addEventListener('submit', async event => {
  event.preventDefault(); const data = new FormData(event.currentTarget); const action = data.get('action');
  try { user = await API.auth(action, Object.fromEntries(data)); $('#auth-panel').classList.add('hidden'); $('#app-panel').classList.remove('hidden'); $('#logout').classList.remove('hidden'); $('#identity').textContent = `${user.name} · ${user.role}`; await refresh(); message('Signed in successfully.', 'success'); }
  catch (error) { message(error.message, 'error'); }
});
$('#auth-mode').addEventListener('click', () => { const register = $('#name-field').classList.toggle('hidden') === false; $('#auth-title').textContent = register ? 'Create an account' : 'Sign in'; $('#auth-submit').textContent = register ? 'Create account' : 'Sign in'; $('#auth-mode').textContent = register ? 'I already have an account' : 'Create an account'; $('#auth-action').value = register ? 'register' : 'login'; });
$('#diagnosis-form').addEventListener('submit', async event => {
  event.preventDefault(); const fields = Object.fromEntries(new FormData(event.currentTarget));
  try { const record = await API.diagnose(fields); showDiagnosis(record); message('Diagnosis saved. Reviewers can verify it.', 'success'); await refresh(); }
  catch (error) { message(error.message, 'error'); }
});
async function refresh() {
  try { const items = await API.list(); $('#history').innerHTML = items.length ? items.map(item => `<div class="result"><span class="pill">${escapeHtml(item.review.status)}</span><h3>${escapeHtml(item.diagnosis.cause)}</h3><p class="muted">${new Date(item.createdAt).toLocaleString()}</p>${user?.role === 'reviewer' && item.review.status === 'pending' ? `<div class="row"><button data-review="accepted" data-id="${item.id}">Accept</button><button class="secondary" data-review="rejected" data-id="${item.id}">Reject</button></div>` : ''}</div>`).join('') : '<p class="muted">No diagnoses yet. Submit an issue to begin.</p>'; }
  catch (error) { message(error.message, 'error'); }
}
$('#history').addEventListener('click', async event => { const button = event.target.closest('[data-review]'); if (!button) return; try { const item = await API.review(button.dataset.id, { status: button.dataset.review }); showDiagnosis(item); await refresh(); } catch (error) { message(error.message, 'error'); } });
$('#logout').addEventListener('click', () => { localStorage.removeItem('netsage-token'); location.reload(); });
$('#upload-form').addEventListener('submit', async event => { event.preventDefault(); const body = new FormData(event.currentTarget); try { const result = await API.request('/api/diagnoses/upload', { method: 'POST', body }); message(result.message, 'success'); } catch (error) { message(error.message, 'error'); } });
if (API.token) { API.me().then(async profile => { user = profile; $('#auth-panel').classList.add('hidden'); $('#app-panel').classList.remove('hidden'); $('#logout').classList.remove('hidden'); $('#identity').textContent = `${user.name} · ${user.role}`; await refresh(); }).catch(() => { localStorage.removeItem('netsage-token'); API.token = ''; }); }
