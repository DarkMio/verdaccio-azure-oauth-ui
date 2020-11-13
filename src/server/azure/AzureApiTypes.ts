

export interface AzureTokenResponse {
    readonly token_type: string;
    readonly scope: string;
    readonly expires_in: number;
    readonly ext_expires_in: number;
    readonly access_token: string;
    readonly refresh_token: string;
    readonly id_token: string;
}

export interface AzureUserInfoResponse {
    readonly sub: string;
    readonly name: string;
    readonly family_name: string;
    readonly given_name: string;
    readonly email: string;
}

export interface AzureMemberGroupResponse {
    readonly value: string[];
}

export interface AzureDirectoryObjectResponse {
    readonly value: AzureGroupObject[];
}

export interface AzureGroupObject {
    readonly id: string;
    readonly deletedDateTime?: string;
    readonly createdDateTime: string;
    readonly creationOptions: string[];
    readonly description?: string;
    readonly displayName?: string;
    readonly expirationDateTime?: string;
    readonly groupTypes: string[];
    readonly isAssignableToRole?: string;
    readonly mail?: string;
    readonly mailEnabled: boolean;
    readonly mailNickname: string;
    readonly membershipRule?: string;
    readonly membershipRuleProcessingState?: string;
    readonly onPremisesDomainName: string;
    readonly onPremisesLastSyncDateTime: string;
    readonly onPremisesNetBiosName: string;
    readonly onPremisesSamAccountName: string;
    readonly onPremisesSecurityIdentifier: string;
    readonly onPremisesSyncEnabled: boolean;
    readonly preferredDataLocation?: string ;
    readonly preferredLanguage?: string;
    readonly proxyAddresses: string[];
    readonly renewedDateTime: string;
    readonly resourceBehaviorOptions: string[];
    readonly resourceProvisioningOptions: string[];
    readonly securityEnabled: boolean;
    readonly securityIdentifier: string;
    readonly theme?: string;
    readonly visibility?: string;
    readonly onPremisesProvisioningErrors: string[];
}