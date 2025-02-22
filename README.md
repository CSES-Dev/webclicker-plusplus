This is the repository for the CSES WebClicker++ project built using [Next.js](https://nextjs.org) bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Install the dependencies from npm:

```bash
npm run i
```

### Update your .env file.

Copy paste the .env.example file and rename it to .env and update it with the values supplied by your EM.

### Generate the prisma types/ config:

```bash
npx prisma generate
```

### Run the development server:

```bash
npm run dev
```

## Code Quality and Linting

This project uses ESLint and Prettier to ensure code quality and consistent formatting.

### Linting Check

To manually check for linting errors, run:

```bash
npm run lint-check
```

### Auto-fix Linting Errors

To automatically fix linting errors, run

```bash
npm run lint-fix
```

### Prettier Formatting

To format your code with Prettier, run

```bash
npx prettier --write .
```

## Committing and Pushing

On commit, linting checks are automatically run to ensure code quality. Fix any errors manually or using the above commands, then stage those changes to proceed.

On push, a secret scan is triggered to ensure no sensitive data is accidentally pushed.

## Running Tests

To run Playwright tests, run

```bash
npm run test
```

## Deployment

On opening a PR to the main branch, the GitHub CI pipeline is automatically run. This runs any playwright tests on a clean build of the app.

Continuous Deployment (Work in Progress)

## Contributing Guidelines

Branching + PR Guidelines (Work in Progress)

## Documentation

Link to Documentation (Work in Progress)
