import type { NextRequest } from 'next/server';

const MAX_BODY_SIZE = 1_048_576; // 1MB

export async function readRequestBody(request: NextRequest) {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
    return null;
  }

  const contentType = request.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return request.json().catch(() => null);
  }

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  const text = await request.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
