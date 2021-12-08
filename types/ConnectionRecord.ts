import { TagRecord } from "./TagRecord";

export interface ConnectionRecord {
    connectionid: string;
    _createdby_value: string;
    _record1id_value: string;
    '_record1id_value@OData.Community.Display.V1.FormattedValue': string;
    '_createdby_value@OData.Community.Display.V1.FormattedValue': string;
    'createdon@OData.Community.Display.V1.FormattedValue': string;
    record1id_skyve_tag: TagRecord|null


}