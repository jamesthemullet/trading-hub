management_zones = {
        trading-hub_non-prod = {
            environment           = "non-prod"
            web_application       = true
            app_hosted_vm         = false
            app_hosted_aks        = false
            app_hosted_appservice = true
            host_group_names      = []
            cluster_name          = ""
            cluster_rg            = ""
            namespace_names       = []
            appservice_names      = ["trading-hub"]
            custom_devices        = []
            database_services     = []
            service_names         = []
        }
    }