import GITHUB_API_CONFIG from "../config/gitHubApiConfig";

const { USERNAME, PER_PAGE } = GITHUB_API_CONFIG;

export const githubPaths = {
  recentRepos: () =>
    `/users/${USERNAME}/repos?type=owner&sort=created&direction=asc&per_page=${PER_PAGE}`,
};
