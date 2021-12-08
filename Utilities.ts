import { TagItem } from "./types/TagItem";
import { TagRecord } from "./types/TagRecord";

export const EntityToTagItem = (entity: ComponentFramework.WebApi.Entity, connectionId?: string, taggedBy?: string): TagItem => {
    //@ts-ignore
    const tag: TagRecord = entity;

    return {
        name: tag.skyve_name,
        key: tag.skyve_tagid,
        tagType: tag['skyve_scope@OData.Community.Display.V1.FormattedValue'],
        createdBy: tag['_createdby_value@OData.Community.Display.V1.FormattedValue'],
        groups: tag.skyve_skyve_tag_skyve_taggroup ? ((tag.skyve_skyve_tag_skyve_taggroup).map((val) => { return val['skyve_name'] }).join(', ')) : undefined,
        toCreate: false,
        entityimage: tag.skyve_entityimage,
        connectionid: connectionId,
        taggedBy: taggedBy
    }
}

export const getLocalString = (context: ComponentFramework.Context<any>, key: string, defaultString: string): string => {
    const result = context.resources.getString(key);
    if (result != key) {
        return result;
    }
    else {
        return defaultString;
    }

}