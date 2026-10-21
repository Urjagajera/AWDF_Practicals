# Practical 1 — Introduction to React and Component Architecture

**CO1 / PO3, PO5** · Objective: set up a React development environment using Vite and build a static UI from
independently structured, reusable components.

A student portfolio for Urja Gajera, built with Vite + React 18 + TypeScript + Tailwind CSS.

## Component tree

```
App.tsx                      composes the page, owns no markup of its own
├── NavBar.tsx   sections[]  sticky nav, highlights the section on screen
├── Header.tsx   name, role, focus, themeColor
├── About.tsx    bio, education, internship
├── Skills.tsx   skillList[]  rendered with map()
├── Projects.tsx projects[]   3 projects (post-lab task)
└── Footer.tsx   name, links[]
    Section.tsx               shared heading frame used by About, Skills, Projects
data/profile.ts               all content; components only receive props
```

## Problem statement → where it is done

| Requirement | Done in |
|---|---|
| React app scaffolded with Vite | `client/` (`vite.config.ts`, `src/main.tsx`) |
| At least 4 reusable components: Header, About, Skills, Footer | `src/components/` |
| Each component independent and composed into one page | `src/App.tsx` |
| No logic or JSX duplicated | the section heading markup is shared through `Section.tsx` |
| Props pass data into at least 2 components | every component gets its data from `App.tsx` (Header, About, Skills, Projects, Footer, NavBar) |

**Supplementary problems:** NavBar highlighting the active section (`IntersectionObserver`), the skills
array passed as a prop and rendered dynamically, and a `themeColor` prop on Header applied as an inline style.

**Post-lab task:** `Projects.tsx` renders 3 projects (Nirman, Strux, NutriFit).

## Run it on its own

```bash
cd practical-1/client
npm install
npm run dev        # http://localhost:5173
```

Or from the repo root, `npm run dev` and open http://localhost:5173/practical-1.

## Key questions

**What is the role of each component?** `Header` introduces the person, `About` gives the bio with education
and internship, `Skills` lists grouped skills, `Projects` shows work, `Footer` holds the contact links, and
`NavBar` moves between them. `App` only arranges them and hands each one its data.

**How does React re-render when props change?** When a parent re-renders with new prop values, React calls
the child function again with the new props, compares the returned elements with the previous output, and
updates only the DOM nodes that changed. Changing `skillList` in `App` re-renders `Skills` and only adds or
removes the affected `<li>` elements (the `key` lets React match items between renders).

**Why does reusability matter in large applications?** A component written once and configured through
props can be used in many places, so a fix or design change happens in one file. Here `Section` gives
About, Skills and Projects the same heading layout without copying markup, and the portfolio content can be
swapped for another student's just by changing `profile.ts`.

## Errors met along the way

- **Port 5173 already in use** — another project's dev server was running on 5173. Vite moves to the next
  free port on its own; for a fixed port, run `npm run dev -- --port 5174` (the fix from the troubleshooting guide).
