import ky from 'ky';

const API_URL = 'http://localhost:3000';

const api = ky.create({
  prefixUrl: API_URL,
  timeout: 30000,
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json'
  },
});

export async function fetchVideoDetails() {
  return api.get('video').json();
}

export async function updateVideoDetails(data) {
  return api.patch('video/update', { json: data }).json();
}

export async function fetchVideoComments() {
  return api.get('comments').json();
}

export async function addComment(text) {
  return api.post('comments', { json: { text } }).json();
}

export async function replyToComment(commentId, text) {
  return api.post('comments/reply', { json: { commentId, text } }).json();
}

export async function deleteComment(commentId) {
  return api.delete(`comments/${commentId}`).json();
}

export async function fetchNotes(videoId) {
  return api.get(`notes/${videoId}`).json();
}

export async function addNote(videoId, content) {
  return api.post('notes', { json: { videoId, content } }).json();
}

export async function updateNote(noteId, content) {
  return api.patch(`notes/${noteId}`, { json: { content } }).json();
}

export async function deleteNote(noteId) {
  return api.delete(`notes/${noteId}`).json();
}

// Video rating functions
export async function getVideoRating() {
  return api.get('video/rating').json();
}

export async function rateVideo(rating) {
  return api.post('video/rate', { json: { rating } }).json();
}

// Auth functions
export async function getCurrentUser() {
  try {
    return await api.get('auth/user').json();
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }
    throw error;
  }
}

export async function logout() {
  return api.get('auth/logout').json();
}

export const authService = {
  login: () => {
    window.location.href = `${API_URL}/auth/google`;
  }
};
