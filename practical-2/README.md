# Practical 2 — State Management and Routing in React

**CO1 / PO3, PO5** · Objective: implement reactive state with `useState` and multi-page navigation with
React Router in the portfolio from Practical 1.

Starts from the Practical 1 snapshot and turns it into a three-route app.

## Structure

```
main.tsx            <BrowserRouter> wraps <App /> once
App.tsx             NavBar + <Routes> + Footer
├── NavBar.tsx      NavLink to / , /projects , /contact  (+ ThemeToggle)
├── "/"          → pages/Home.tsx          Header + About + Skills
├── "/projects"  → pages/ProjectsPage.tsx  Projects
├── "/contact"   → pages/Contact.tsx       controlled form, useState
└── "*"          → pages/NotFound.tsx      custom 404
```

## Problem statement → where it is done

| Requirement | Done in |
|---|---|
| React Router added to the Practical 1 portfolio | `src/main.tsx`, `src/App.tsx` |
| Navigation bar with Home, Projects and Contact | `src/components/NavBar.tsx` |
| Each route renders a distinct component, no page reload | `NavLink` / `Link` everywhere, never `<a href>` for internal routes |
| One `useState` toggles UI visibility | `showHelp` in `Contact.tsx` opens / closes the help tip |
| One `useState` manages form input | `name` and `message` in `Contact.tsx` |
| Controlled input shown in real time | the Live preview panel next to the form |

**Supplementary / post-lab:** a 404 route (`NotFound.tsx`), a dark/light toggle in `useState` that applies
the `dark` class to `<html>` (`ThemeToggle.tsx`), and a live character count under the message (`0 / 500`).
Sending the form opens the visitor's mail app with the name and message filled in.

Checked in the browser: clicking Projects changes the URL to `/projects` while a value set on `window` stays
— proof that the page did not reload; typing updates the count and preview on every keystroke; an unknown
path shows the 404 page.

## Run it on its own

```bash
cd practical-2/client
npm install
npm run dev        # http://localhost:5173
```

Or from the repo root, `npm run dev` and open http://localhost:5173/practical-2.

## Key questions

**What is the role of each component?** `main.tsx` provides the router, `App` declares which component each
path renders, `NavBar` moves between paths, and each page component owns one screen. `Contact` is the only
page with its own state, because it is the only one whose content changes as the user interacts.

**How does React re-render when props or state change?** Calling `setMessage` schedules a re-render of
`Contact`; React runs the function again with the new state and patches only the changed DOM (the textarea
value, the preview text and the count). A route change works the same way: the router's location state
changes, so `<Routes>` renders a different element, without the browser fetching a new page.

**Why is component reusability important?** The Practical 1 components (`Header`, `About`, `Skills`,
`Projects`, `Footer`) were reused unchanged inside the new pages; only the composition changed. That is what
makes it cheap to restructure a growing app.

## Errors met along the way

- `npm install react-router-dom -w practical-2/client` did not add the dependency the first time, because the
  new folder was not yet a registered workspace. Adding it to `package.json` and running `npm install` from
  the repo root fixed it.
