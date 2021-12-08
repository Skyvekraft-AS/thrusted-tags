
export const GetAllowedScopes = (context: ComponentFramework.Context<any>) => {
    const allowedScopes: number[] = []
    if (context.parameters['Allow_Personal_Tags'] && context.parameters['Allow_Personal_Tags'].raw === 'Yes') {
        allowedScopes.push(970380000)
    }
    if (context.parameters['Allow_Organizational_Tags'] && context.parameters['Allow_Organizational_Tags'].raw === 'Yes') {
        allowedScopes.push(970380001)
    }
    if (context.parameters['Allow_Global_Tags'] && context.parameters['Allow_Global_Tags'].raw === 'Yes') {
        allowedScopes.push(970380002)
    }
    return allowedScopes
}

export const RequireUntagConfirmation = (context: ComponentFramework.Context<any>) => {
    if (context.parameters['RequireUntagConfirmation'] && context.parameters['RequireUntagConfirmation'].raw === 'Yes') {
        return true
    }
    else return false

}