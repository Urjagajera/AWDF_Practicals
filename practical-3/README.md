# Practical 3 — API Integration and Data Rendering in React

**CO1 / PO3, PO5** · Objective: consume a REST API in React and handle asynchronous data with loading and
error states.

Starts from the Practical 2 snapshot. The Projects page now also lists Urja's public repositories, fetched
live from `https://api.github.com/users/Urjagajera/repos`.

## Flow

```
ProjectsPage.tsx
└── GitHubRepos.tsx
      useEffect()  → fetch on mount (and again on "Try again")
      useState: repos, loading, error   (+ query, attempt)
      [loading]  → <Spinner />
      [error]    → <ErrorMessage message={error} onRetry={…} />
      [success]  → search box + <RepoList data={filtered} />
```

## Problem statement → where it is done

| Requirement | Done in |
|---|---|
| Public REST API (GitHub) fetched and shown dynamically | `src/components/GitHubRepos.tsx` |
| Integrated into the Projects page from Practical 2 | `src/pages/ProjectsPage.tsx` |
| Loading spinner while the request runs | `src/components/Spinner.tsx` |
| Error message when the call fails | `src/components/ErrorMessage.tsx` |
| Name and URL for each repository | `src/components/RepoList.tsx` |

**Supplementary / post-lab:** a "Try again" button that re-triggers the fetch, a search input that filters
by name, and the star count next to each repository (plus description and language when present).

Two details beyond the lab sheet code:

- `fetch` does not reject on HTTP errors, so a 404 or GitHub's rate-limit 403 would otherwise be treated as
  success. The response is checked with `res.ok` and thrown, so it lands in the error state.
- An `AbortController` cancels the request when the component unmounts, so a late response never sets state
  on a component that is gone (this also keeps React 18 StrictMode's double effect run clean).

**Tested both paths in the browser:** the happy path renders all 22 repositories; with the GitHub request
forced to answer `404 Not Found`, the page shows *"GitHub responded with 404 Not Found"* and a Try again
button, and pressing it after restoring the network loads the list. Typing `awdf` in the filter leaves 3 of 22.

## Run it on its own

```bash
cd practical-3/client
npm install
npm run dev        # http://localhost:5173/projects
```

## Key questions

**Why is `useEffect` needed instead of calling fetch in the component body?** The component body runs on
every render. A fetch there would call `setRepos`, which triggers a render, which fetches again — an
infinite loop. `useEffect` runs after rendering, and its dependency array controls *when*: `[attempt]` means
"once on mount, and again only when the user retries".

**Why handle loading and error separately?** They mean different things to the user: loading means "wait,
data is coming", error means "it isn't coming — here is why, and here is what you can do". With only one
of them, a failure would look like an endless spinner, or a slow request would look like a failure.

**How would the UX change without them?** Without a loading state the section would be empty (or say "no
repositories") until data arrives, which is misleading. Without an error state a failed request leaves a
permanent spinner or a blank area with no explanation and no way to retry.

## Errors met along the way

- The first version treated GitHub's HTTP error responses as data, because `fetch` resolves for any HTTP
  status. Checking `res.ok` and throwing fixed it, which made the error path testable.
