import { TagItem } from "../types/TagItem"

export class TagService {

    private webApi: ComponentFramework.WebApi
    private userId: string

    constructor(context: ComponentFramework.Context<any>) {
        this.webApi = context.webAPI
        this.userId = context.userSettings.userId
    }
    public unlinkTag(connectionId: string): Promise<ComponentFramework.LookupValue> {
        return this.webApi.deleteRecord('connection', connectionId)
    }

    public getTagsForRecord(entityId: string) {
        return this.webApi.retrieveMultipleRecords('connection'
            , `?$filter=(_record1id_value eq ${entityId} or _record2id_value eq ${entityId}) and _record1roleid_value eq ${'9d4c6bf8-8c93-ea11-a811-000d3ab8d5b5'}&$expand=record1id_skyve_tag($select=skyve_scope,skyve_entityimage,skyve_name,skyve_tagid,createdby)`)
    }

    public recordIsTaggedBy(entityId: string, tagId: string) {
        return this.webApi.retrieveMultipleRecords('connection'
            , `?$filter=(_record1id_value eq ${tagId} and _record2id_value eq ${entityId}) and _record1roleid_value eq ${'9d4c6bf8-8c93-ea11-a811-000d3ab8d5b5'}&$expand=record1id_skyve_tag($select=skyve_scope,skyve_entityimage)`).then((res) => {
                return res.entities.length > 0
            })
    }

    public createTagLink(entity: ComponentFramework.WebApi.Entity): Promise<ComponentFramework.LookupValue> {
        return this.webApi.createRecord('connection', entity)
    }

    public async createTag(entity: ComponentFramework.WebApi.Entity): Promise<ComponentFramework.LookupValue> {
        return this.webApi.createRecord('skyve_tag', entity)
    }

    public getTagGroups(tagId: string) {
        return this.webApi.retrieveRecord('skyve_tag', tagId, '?$expand=skyve_skyve_tag_skyve_taggroup($select=skyve_name)').then((result) => {
            return result.skyve_skyve_tag_skyve_taggroup as ComponentFramework.WebApi.Entity[]
        })
    }

    public getTagsByFilter(filter: string) {
        const filterParam = filter ? `$filter=${filter}&` : ''
        return this.webApi.retrieveMultipleRecords('skyve_tag', `?${filterParam}$expand=skyve_skyve_tag_skyve_taggroup($select=skyve_name)`)

    }

    public async createTags(newTags: TagItem[], addToEntityId: string, entityMeta: ComponentFramework.PropertyHelper.EntityMetadata) {
        const bindProperty = `record2id_${entityMeta.LogicalName}@odata.bind`
        const entityRef = `/${entityMeta.EntitySetName}(${addToEntityId})`
        for (const tag of newTags) {
            if (tag.connectionid) {
                continue
            }

            if ((tag).toCreate !== true) {
                let entity: ComponentFramework.WebApi.Entity = {
                    'record1id_skyve_tag@odata.bind': `/skyve_tags(${tag.key})`,
                    'record1roleid@odata.bind': `/connectionroles(9d4c6bf8-8c93-ea11-a811-000d3ab8d5b5)`,
                    'record2roleid@odata.bind': `/connectionroles(AD2161E6-8C93-EA11-A811-000D3AB8D5B5)`
                }
                entity[bindProperty] = entityRef
                await this.createTagLink(entity)
            }
            else {
                let tagEntity = {
                    skyve_scope: 970380000,
                    skyve_name: tag.name.trim()
                }
                //prevent creating dups
                const existingTags = await this.getTagsByFilter(`skyve_name eq '${tag.name.trim()}' and skyve_scope eq 970380000 and _ownerid_value eq ${this.userId}`)
                if (!existingTags.entities || existingTags.entities.length === 0) {
                    const newTag = await this.createTag(tagEntity)
                    let entity: ComponentFramework.WebApi.Entity = {
                        'record1id_skyve_tag@odata.bind': `/skyve_tags(${newTag.id})`,
                        'record1roleid@odata.bind': `/connectionroles(9d4c6bf8-8c93-ea11-a811-000d3ab8d5b5)`,
                        'record2roleid@odata.bind': `/connectionroles(AD2161E6-8C93-EA11-A811-000D3AB8D5B5)`
                    }
                    entity[bindProperty] = entityRef
                    await this.createTagLink(entity)

                }
                else {
                    const isTagged = await this.recordIsTaggedBy(addToEntityId, existingTags.entities[0]['skyve_tagid'])
                    if (!isTagged) {
                        let entity: ComponentFramework.WebApi.Entity = {
                            'record1id_skyve_tag@odata.bind': `/skyve_tags(${existingTags.entities[0]['skyve_tagid']})`,
                            'record1roleid@odata.bind': `/connectionroles(9d4c6bf8-8c93-ea11-a811-000d3ab8d5b5)`,
                            'record2roleid@odata.bind': `/connectionroles(AD2161E6-8C93-EA11-A811-000D3AB8D5B5)`
                        }
                        entity[bindProperty] = entityRef
                        await this.createTagLink(entity)
                    } // esle ignore


                }
            }
        }

    }


}