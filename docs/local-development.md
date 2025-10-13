## Development Workflow

1. **Start the Development Server**

   ```bash
   npm run dev
   ```

2. **Running Tests**
   - Unit Tests: `npm run test`
   - E2E Tests: `npm run test:e2e:ui`
   - Mock Tests: Use Playwright UI and select "mock" project

3. **Code Quality Checks**

   ```bash
   npm run lint        # Run ESLint
   npm run format      # Run Prettier
   npm run ts-check    # Run TypeScript checks
   ```

4. **Building for Production**
   ```bash
   npm run build
   ```

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

#### Cleaning

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

##### Docker failure locally

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
