additional_tags = {
  IOCode             = ""       # Required tag: IOCode of format eg 2000nnnn - can be provided by your delivery owner. #CHANGEME
  Portfolio          = "DotCom" # Required tag: Change as required . #CHANGEME
  EA_Application_ID  = "XX"     # Required tag: You should have received it from the ecosystem builder in your mailbox . #CHANGEME
  BC_Priority        = "M1"
  ExpiryDate         = ""
  SupportContact     = "" # Required tag: your group mailbox eg: grp-adcp@mnscorp.onmicrosoft.com . #CHANGEME
  DataClassification = "Internal"
  deploy_app_name    = "trading-hub"
}
app_name         = "trading-hub" #CHANGEME # Required : Change this as you see appropriate "Preferrably: alphanumberical with hyphens as allowed characters"
github_repo_name = "trading-hub-release"
port             = "4000"
stack_version    = "1"

allowed_uris = ["/health"] #CHANGEME # Update to include your allowed paths

app_stack = "NODE|18-lts" # Required tag: Provide app_stack details. eg: NODE|16-lts, DOCKER
use_oidc  = "true"       # Required tag: Set used_oidc as true for using Federated Credentials.

application_stack = {
  node_version = "16-lts" #CHANGEME # Required set appropriate version of your runtime.
}

#duplicated from app_name as PR environemnts appname is overridden
newrelic_app_name = "trading-hub" #CHANGEME

# Custom DNS
# Uncomment & provide parent domain to be used if custom DNS is required (for production use-cases). This will deploy DNS zones.
# Otherwise, leave it commented and default Azure domains will be used (good for quick prototypes and demos)
# domain_suffix     = "engineering.mnscorp.net" 
