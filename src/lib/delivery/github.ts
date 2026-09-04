import "server-only";
import { CONNECT_SPECS } from "@/content/connect-specs";
import { applyFailure, failure, scrub, type ApplyResult, type DeliveryClient, type DeliveryTarget, type VerifyResult } from "./types";

/**
 * GitHub delivery: one approved fix becomes one branch and one pull request.
 *
 * Written against the Git Data API rather than the Contents API so a change
 * touching four files is a single commit the customer can review as one diff,
 * instead of four commits that have to be read in sequence.
 *
 * We never push to the default branch and never merge. The PR is the handoff.
 */

const API = "https://api.github.com";
const TIMEOUT_MS = 20_000;

interface GhError {
  message?: string;
}

async function gh<T>(
  path: string,
  secret: string,
  init: { method?: string; body?: unknown } = {},
): Promise<{ ok: boolean; status: number; data: T }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API}${path}`, {
      method: init.method ?? "GET",
      signal: controller.signal,
      headers: {
        authorization: `Bearer ${secret}`,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
        "user-agent": "RankVyze/1.0",
        ...(init.body ? { "content-type": "application/json" } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
    });
    const text = await res.text();
    const data = text ? (JSON.parse(text) as T) : ({} as T);
    return { ok: res.ok, status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

/** Accepts a full URL or "owner/name" and returns "owner/name". */
export function normalizeRepo(input: string): string | null {
  const trimmed = input.trim().replace(/\.git$/, "").replace(/\/+$/, "");
  const fromUrl = trimmed.match(/github\.com[/:]([^/]+)\/([^/]+)/i);
  if (fromUrl) return `${fromUrl[1]}/${fromUrl[2]}`;
  const bare = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  return bare ? `${bare[1]}/${bare[2]}` : null;
}

function branchName(title: string): string {
  const slug =
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "aeo-fix";
  // A timestamp suffix means re-running a change never collides with the
  // branch left behind by the previous attempt.
  return `rankvyze/${slug}-${Date.now().toString(36)}`;
}

export const githubClient: DeliveryClient = {
  provider: "GITHUB",
  ...CONNECT_SPECS.GITHUB,

  async verify(target: DeliveryTarget): Promise<VerifyResult> {
    const repo = normalizeRepo(target.config.repo ?? "");
    if (!repo) return failure("That doesn't look like a GitHub repository. Use owner/name or the repository URL.");

    try {
      const res = await gh<{ full_name: string; permissions?: { push?: boolean }; default_branch: string } & GhError>(
        `/repos/${repo}`,
        target.secret,
      );
      if (res.status === 401) return failure("GitHub rejected that token. Check it hasn't expired or been revoked.");
      if (res.status === 404) {
        return failure(
          "GitHub can't see that repository with this token. Check the name, and that the token's repository access includes it.",
        );
      }
      if (!res.ok) return failure(scrub(res.data.message ?? `GitHub returned ${res.status}.`, target.secret));

      if (!res.data.permissions?.push) {
        return failure(
          "That token can read the repository but not write to it. It needs Contents: read & write to open pull requests.",
        );
      }

      const branch = target.config.branch?.trim() || res.data.default_branch;
      const ref = await gh<GhError>(`/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`, target.secret);
      if (!ref.ok) return failure(`The branch "${branch}" doesn't exist in ${repo}.`);

      return {
        ok: true,
        account: res.data.full_name,
        confirmed: [`Write access to ${res.data.full_name}`, `Base branch "${branch}" exists`, "Can open pull requests"],
      };
    } catch (e) {
      return failure(scrub(e instanceof Error ? e.message : "Could not reach GitHub.", target.secret));
    }
  },

  async apply(target: DeliveryTarget, change): Promise<ApplyResult> {
    const repo = normalizeRepo(target.config.repo ?? "");
    if (!repo) return applyFailure("No repository is configured for this site.");
    if (!change.files?.length) return applyFailure("This change has no files, so there is nothing to commit.");

    try {
      const repoInfo = await gh<{ default_branch: string }>(`/repos/${repo}`, target.secret);
      if (!repoInfo.ok) return applyFailure("Lost access to the repository. Reconnect GitHub in Settings.");
      const base = target.config.branch?.trim() || repoInfo.data.default_branch;

      const ref = await gh<{ object: { sha: string } }>(
        `/repos/${repo}/git/ref/heads/${encodeURIComponent(base)}`,
        target.secret,
      );
      if (!ref.ok) return applyFailure(`The base branch "${base}" no longer exists.`);
      const baseSha = ref.data.object.sha;

      const baseCommit = await gh<{ tree: { sha: string } }>(`/repos/${repo}/git/commits/${baseSha}`, target.secret);
      if (!baseCommit.ok) return applyFailure("Could not read the base commit.");

      // One tree, one commit: the customer reviews a single coherent diff.
      const tree = await gh<{ sha: string } & GhError>(`/repos/${repo}/git/trees`, target.secret, {
        method: "POST",
        body: {
          base_tree: baseCommit.data.tree.sha,
          tree: change.files.map((f) => ({
            path: f.path.replace(/^\/+/, ""),
            mode: "100644",
            type: "blob",
            content: f.content,
          })),
        },
      });
      if (!tree.ok) return applyFailure(scrub(tree.data.message ?? "Could not build the commit.", target.secret));

      const commit = await gh<{ sha: string } & GhError>(`/repos/${repo}/git/commits`, target.secret, {
        method: "POST",
        body: {
          message: `${change.title}\n\n${change.summary}\n\nOpened by RankVyze. Review and merge at your own pace.`,
          tree: tree.data.sha,
          parents: [baseSha],
        },
      });
      if (!commit.ok) return applyFailure(scrub(commit.data.message ?? "Could not create the commit.", target.secret));

      const branch = branchName(change.title);
      const created = await gh<GhError>(`/repos/${repo}/git/refs`, target.secret, {
        method: "POST",
        body: { ref: `refs/heads/${branch}`, sha: commit.data.sha },
      });
      if (!created.ok) return applyFailure(scrub(created.data.message ?? "Could not create the branch.", target.secret));

      const pr = await gh<{ html_url: string; number: number } & GhError>(`/repos/${repo}/pulls`, target.secret, {
        method: "POST",
        body: {
          title: change.title,
          head: branch,
          base,
          body: `${change.summary}\n\n---\nOpened by [RankVyze](https://rankvyze.com). Nothing is merged for you — review and merge when you're ready. After your deploy we re-check the live URL and confirm the change is actually visible to answer engines.`,
        },
      });
      if (!pr.ok) {
        return {
          ok: false,
          live: false,
          detail: `The commit is on branch ${branch}, but the pull request could not be opened.`,
          rollback: { branch },
          error: scrub(pr.data.message ?? "Could not open the pull request.", target.secret),
        };
      }

      return {
        ok: true,
        reviewUrl: pr.data.html_url,
        live: false,
        rollback: { branch, prNumber: pr.data.number },
        detail: `Pull request #${pr.data.number} opened against ${base}. Nothing is live until you merge and deploy.`,
      };
    } catch (e) {
      return applyFailure(scrub(e instanceof Error ? e.message : "Could not reach GitHub.", target.secret));
    }
  },
};
