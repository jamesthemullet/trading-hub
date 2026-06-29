# Local Development

## Development Workflow

1. **Start the Development Server**

   ```bash
   pnpm run dev
   ```

2. **Running Tests**
   - Unit Tests: `pnpm run test`
   - E2E Tests: `pnpm run test:e2e:ui`
   - Mock Tests: Use Playwright UI and select "mock" project

3. **Code Quality Checks**

   ```bash
   pnpm run lint        # Run ESLint
   pnpm run format      # Run Prettier
   pnpm run ts-check    # Run TypeScript checks
   ```

4. **Building for Production**

   ```bash
   pnpm run build
   ```

## Flags Page Access

The /flags page uses server-side email allowlisting.

- Add FLAGS_ALLOWED_EMAILS to your local .env as a comma-separated email list.
- Example: FLAGS_ALLOWED_EMAILS=you@marks-and-spencer.com,teammate@marks-and-spencer.com
- If /flags redirects to /, verify your signed-in email appears in FLAGS_ALLOWED_EMAILS (matching is case-insensitive).

## Migrating from npm to pnpm

If you were previously using npm, follow these steps to switch to pnpm:

1. **Install pnpm** (if not already installed)

   ```bash
   npm install -g pnpm
   ```

2. **Remove old npm artifacts**

   ```bash
   rm -rf node_modules
   rm -f package-lock.json
   ```

3. **Install dependencies with pnpm**

   ```bash
   pnpm install
   ```

4. **Verify installation**

   ```bash
   pnpm run dev
   ```

> **Note:** All npm commands should now use pnpm (e.g. `npm run dev` → `pnpm run dev`, `npx` → `pnpm exec`)

## Docker Development

1. **Build application-dev for the search service**
   Use repo https://github.com/DigitalInnovation/search-service

   ```bash
   docker-compose build application-dev
   ```

2. **Switch to local mode in docker-compose.yml**

3. **Build and Run with Docker Compose**

   ```bash
   docker-compose build
   docker-compose up
   ```

### Cleaning

When you are done, execute:

```bash
docker-compose down -v --remove-orphans
```

To update the backend api docker image:

1. Find what is the latest version, unfortunately search-service is not producing that version number in a visible place so we need to do some digging, you can do it by:
   - navigate to [java-app-deploy.yml](https://github.com/DigitalInnovation/search-service/actions/workflows/java-app-deploy.yml)
   - Click on the most up to date run.
   - Click on "Building Jar" tab on the left
   - Click on "========== Build and push Build Artifacts to artifact Store ==========" task
   - Scroll to the bottom
   - There should be log that says something like "#13 naming to docker.io/library/search-service-webapp:713 done"
   - In my case version is 713, but it might be different one in your case
   - Copy that version number

2. In `docker-compose.yml` find line that says `image: ghcr.io/digitalinnovation/search-service/search-service-webapp:712`
   - The number at the end will be different, just replace it with new version

3. Save, commit, push.

### Docker failure locally

Some machines will not be able to run the docker image locally and will get the following error

`application-dev The requested image's platform (linux/amd64) does not match the detected host platform (linux/arm64/v8) and no specific platform was requested`

1. Checkout search-service repo
2. Run `docker-compose build application-dev `
3. In trading hub docker, change application-dev image to `search-service-application-dev:latest` (commented out in code)
4. Build and run docker as per above steps

### Authentication Issues

1. **No Redirect After Login**
   - Check if `NEXTAUTH_URL` matches your local development URL
   - Verify Azure AD callback URL configuration

2. **API Connection Failed**
   - Ensure `MERCHANDISING_API_BASEURL` is correct
   - Check zscaler

### Docker Issues

1. **Volume Mount Issues**
   - Run `docker-compose down --volumes --remove-orphans` to clean volumes
   - Check file permissions
