export interface Tag
{
    tagId:string;
    tagName:string;
    type:TagType;
    connectionid:string;
    taggedBy:string;
    taggedByName:string;
    createdon:string;
    entityimage?:string;
}

export const enum TagType{
    Public='Public',
    Private='Private',
    Organizational='Organizational'

}