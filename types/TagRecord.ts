import { TagType } from "../TagList/Tag";

export interface TagRecord {
    skyve_name: string;
    skyve_skyve_tag_skyve_taggroup?: { skyve_name: string }[]
    skyve_entityimage?: string;
    skyve_scope: number;
    skyve_tagid: string;
    'skyve_scope@OData.Community.Display.V1.FormattedValue': TagType;
    '_createdby_value@OData.Community.Display.V1.FormattedValue'?: string;
}