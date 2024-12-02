# PR Preview Pipeline Authentication

![Image showing PR Preview pipeline Architecture](img/pr-preview-auth-architecture-diagram.png 'PR Preview Auth')

Important Highlights:

- github-trading-hub is main Service Principal that is used to create other SP. This avoids having mixed permissions within single SP.
- Github worker authenticates as github-trading-hub using federated credentials, the safest method of authentication that doesn't require storing and updating secrets.
- prs-ar-trading-hub is a SP used for PR Preview Pipelines authentication. Its main goal is to store redirect uris and secrets for each PR environment authentication provider.
- PR Preview Environments are still created by Brightcloud, only the authentication is managed by github-trading-hub SP.
- Each PR Preview Environment gets its own secret that is destroyed once corresponding PR is closed. Together with federated credentials, it creates environment where no secrets are expected to expire.
- prs-ar-trading-hub is easy to change since its lifecycle is controlled by pr-infrastructure.yml file, in the future we should consider migrating to the bicep file instead of having imperative code in the pipeline, but as of today(02/12/2024) there is a bug in azure that prevents bicep file to create app registrations without tenant level access which M&S is trying to avoid as per team basis.
