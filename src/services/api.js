export class ApiError extends Error {
  constructor(message, fields = {}) {
    super(message);
    this.name = 'ApiError';
    this.fields = fields;
  }
}

export async function api(path, { method = 'GET', body, signal } = {}) {
  let response;
  try {
    response = await fetch(`/api/${path}`, {
      method,
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('No hay conexión con el servidor. Revisa que esté en ejecución.');
  }

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(data.error || 'Ocurrió un error inesperado.', data.fields);
  return data;
}
