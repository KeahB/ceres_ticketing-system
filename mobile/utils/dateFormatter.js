export function formatDateTime(dateString) {
  const date = dateString ? new Date(dateString) : new Date();
  
  return date.toLocaleDateString() + ' ' + 
         date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(dateString) {
  const date = dateString ? new Date(dateString) : new Date();
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTime(dateString) {
  const date = dateString ? new Date(dateString) : new Date();
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
