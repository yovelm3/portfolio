# Academic projects

Coursework from a B.Sc. in Industrial Engineering & Management.

## Project monitoring dashboard (`project-monitor/`)

A critical path and earned value dashboard for a software project, built from a course initiation document. Execution data is simulated.

## Supermarket checkout simulation (`simulation/`)

An Arena discrete-event model of supermarket checkouts, built from input analysis of observed customer records and validated on customers per day and time in system. Also includes an Excel Monte Carlo model of a tennis tournament with 10,000 replications.

- `simulation/index.html`: results page
- `simulation/source/arena_supermarket_model.doe`: Arena model
- `simulation/source/tennis_monte_carlo.xlsx`: Monte Carlo workbook

## Voting-pattern analysis with PCA (`data-mining/`)

Python analysis of Knesset 24 and 25 results: data cleaning, exploratory analysis, PCA with different scaling methods, and projection of both elections onto shared axes.

- `data-mining/index.html`: results page
- `data-mining/source/`: Python scripts, report and BIRCH clustering notes

The scripts expect the election results files in the same folder. These files are not included.

## FitFirst (`fitfirst/`)

Personal project: a mobile-first web app where women who train build a workout look on a mannequin with their own shape, get the right size in every brand, and see the best final price for the whole look. Vite + React + TypeScript, with Vitest tests for the fit and price engines. Demo data only for now. See `fitfirst/README.md`.

## Live pages

The site is built and published by `.github/workflows/pages.yml`. One-time setup: Settings → Pages → Source: "GitHub Actions". After that, every push to `main` publishes the site.
