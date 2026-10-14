import GITHUB_API_CONFIG from "../config/gitHubApiConfig";
import { liveEnabled } from "../data/formation";
import API_CONFIG from "../config/apiConfig";

const { BASE_URL, PROXY_PATH } = GITHUB_API_CONFIG;

export class GitHubRateLimitError extends Error {}

const isRateLimited = (response: Response) => response.status === 403 || response.status === 429;

async function viaProxy(path: string): Promise<Response | null> {
  if (!liveEnabled) return null;
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${PROXY_PATH}?${new URLSearchParams({ path })}`);
    if (!response.headers.get("X-GitHub-Proxy") || response.status === 503) return null;
    return response;
  } catch {
    return null;
  }
}

export async function fetchGitHub<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      headers: { Accept: "application/vnd.github+json" },
    });
  } catch (error) {
    const proxied = await viaProxy(path);
    if (!proxied) throw error;
    response = proxied;
  }
  if (isRateLimited(response)) response = (await viaProxy(path)) ?? response;
  if (isRateLimited(response)) throw new GitHubRateLimitError(`GitHub: HTTP ${response.status}`);
  if (!response.ok) throw new Error(`GitHub: HTTP ${response.status}`);
  return response.json() as Promise<T>;
}
