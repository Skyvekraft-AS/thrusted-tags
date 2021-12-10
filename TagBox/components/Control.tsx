import * as React from "react"
import { IInputs } from "../generated/ManifestTypes"
import { Label } from "@fluentui/react/lib/Label"
import { Text } from "@fluentui/react/lib/Text"
import { Link } from "@fluentui/react/lib/Link"
import { Stack } from "@fluentui/react/lib/Stack"
import { HoverCard, HoverCardType, IPlainCardProps } from "@fluentui/react/lib/HoverCard"
import { Picker } from "../../TagList/components/Picker"
import { TagService } from "../../services/TagService"
import { EntityToTagItem, getLocalString } from "../../Utilities"
import { Card } from "@fluentui/react-cards/lib/Card"
import { GroupsField } from "../../TagList/components/GroupsField"
import { GetAllowedScopes, RequireUntagConfirmation } from "../../InputUtils"
import { TagItem } from "../../types/TagItem"

export const Control: React.FunctionComponent<{ context: ComponentFramework.Context<IInputs> }> = ({ context }) => {
    const entityId = context.parameters.Record_Id.raw || ""
    const entityTypeName = context.parameters.Entity_Name.raw || ""
    const [tagService,] = React.useState<TagService>(new TagService(context))
    const [key] = React.useState(`pickerKey`)
    const [selectedTags, setSelectedtags] = React.useState<TagItem[]>([])
    const [update, setUpdate] = React.useState(0)
    const onAdded = () => {
        setUpdate((current) => { return current + 1 })
    }

    const allowedScopes = GetAllowedScopes(context)

    const untag = React.useCallback((item: TagItem) => {
        const index = selectedTags?.indexOf(item)
        if (item.connectionid) {
            tagService.unlinkTag(item.connectionid).then(() => {
                selectedTags?.splice(index as number, 1)
                setSelectedtags([...selectedTags])
            })
        }
        else {
            selectedTags?.splice(index as number, 1)
            setSelectedtags([...selectedTags])
        }
    }, [tagService])

    const onRemove = React.useCallback((item: TagItem) => {
        if (RequireUntagConfirmation(context)) {
            const title = getLocalString(context, 'Confirm_Untag_Title', 'Confirm untag')
            const confirmBody = getLocalString(context, 'Confirm_Untag_Text', 'Confirm or Cancel removal of Tag:')
            const confirmButtonLabel = getLocalString(context, 'Confirm_Untag_Button_text', 'Confirm')
            const cancelButtonLabel = getLocalString(context, 'Cancel_Untag_Button_text', 'Cancel')

            context.navigation.openConfirmDialog({ title: title, text: `${confirmBody} '${item.name}'`, confirmButtonLabel: confirmButtonLabel, cancelButtonLabel: cancelButtonLabel }).then((result) => {
                if (result.confirmed) {
                    untag(item)
                }
            })

        }
        else {
            untag(item)
        }
    }, [])

    React.useEffect(() => {
        tagService.getTagsForRecord(entityId)
            .then((results) => {
                const tags: TagItem[] = []
                results.entities.map((x) => {
                    const item = EntityToTagItem(x['record1id_skyve_tag'], x.connectionid, x['_createdby_value@OData.Community.Display.V1.FormattedValue'])
                    if (allowedScopes.length === 0 || allowedScopes.indexOf(x.record1id_skyve_tag['skyve_scope']) >= 0) {
                        tags.push(item)
                    }
                })
                setSelectedtags(
                    tags
                )
            })
    }, [update])

    const onRenderPlainCard = (tag: TagItem): JSX.Element => {
        return <Card styles={{ root: { padding: 8 } }}>
            <Card.Section>
                <Text style={{ fontWeight: 600 }}>{tag.name.toUpperCase()}</Text>
            </Card.Section>
            <Card.Section >
                <Label>Groups:</Label>
                <GroupsField context={context} tagId={tag.key as string} />
            </Card.Section>
            <Card.Section >
                <Label>Type:</Label>
                <Text>{tag.tagType}</Text>
                <Label>Tagged By:</Label>
                <Text>{tag.taggedBy}</Text>
            </Card.Section>
        </Card>
    }
    return (
        <div className={"control"}>
            <Stack>
                <Picker
                    innerElement={(tag) => {
                        const plainCardProps: IPlainCardProps = {
                            onRenderPlainCard: onRenderPlainCard,
                            renderData: tag
                        };
                        return <Stack>
                            <HoverCard plainCardProps={plainCardProps} instantOpenOnClick type={HoverCardType.plain}>
                                <Stack>
                                    <Link styles={{ root: { fontSize: 'medium' } }} onClick={() => { context.navigation.openForm({ entityName: 'skyve_tag', entityId: tag.key as string, openInNewWindow: true }) }} >{tag.name} </Link>
                                    <Text>{tag.tagType}</Text>
                                </Stack>
                            </HoverCard>
                        </Stack>
                    }}
                    showAdd={false}
                    existingTags={selectedTags}
                    pickerKey={key}
                    context={context} entityId={entityId}
                    entityTypeName={entityTypeName}
                    onAdded={onAdded}
                    onRemove={onRemove}
                    onSelected={(tag) => {
                        if (!tag) {
                            return null
                        }

                        context.utils.getEntityMetadata(entityTypeName).then((entityMeta) => {
                            tagService.createTags([tag], entityId, entityMeta).then(() => onAdded())
                        })

                        return tag as TagItem
                    }}
                />
            </Stack>
        </div>
    )
}
