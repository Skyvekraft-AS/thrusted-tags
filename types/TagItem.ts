import { ITag } from "@fluentui/react/lib/Pickers";

export interface TagItem extends ITag {
    tagType?: string;
    groups?: string;
    createdBy?: string;
    toCreate?: boolean;
    entityimage?: string;
    connectionid?: string;
    taggedBy?: string;
}