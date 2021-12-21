import * as React from "react"
import { DetailsList, IColumn, SelectionMode } from '@fluentui/react/lib/DetailsList'
import { Image } from "@fluentui/react/lib/Image"
import { Icon } from "@fluentui/react/lib/Icon"
import { Link } from '@fluentui/react/lib/Link'
import { TooltipHost, TooltipOverflowMode } from '@fluentui/react/lib/Tooltip'
import { Stack } from '@fluentui/react/lib/Stack'
import { Tag, TagType } from "../Tag";
import { TagService } from "../../services/TagService";
import { GroupsField } from "../components/GroupsField";
import { UntagFlyout } from "../components/UntagFlyout";
import { GetAllowedScopes } from "../../InputUtils";
import { getLocalString } from "../../Utilities";
import { IInputs } from "../generated/ManifestTypes"
import { ConnectionRecord } from "../../types/ConnectionRecord"

export interface ITagsListProps {
    context: ComponentFramework.Context<IInputs>
    entityId: string
    entityTypeName: string
}

export interface ITagsListState extends React.ComponentState, ITagsListProps {
    columns: IColumn[];
    tags: Tag[];
}

export class TagsListControl extends React.Component<ITagsListProps, ITagsListState> {

    private columns: IColumn[] = [
        {
            fieldName: 'actions',
            name: getLocalString(this.props.context, 'Untag_Title', 'Untag'),
            minWidth: 40,
            maxWidth: 75,
            key: 'actions',
            isResizable: true
        },
        {
            fieldName: 'tagName',
            name: getLocalString(this.props.context, 'Tag_Title', 'Tag'),
            minWidth: 150,
            key: 'tagName',
            isResizable: true
        },
        {
            fieldName: 'tagGroups',
            name: getLocalString(this.props.context, 'Tag_Groups_Title', 'Tag Groups'),
            minWidth: 150,
            key: 'tagGroups',
            isMultiline: true,
            isResizable: true
        },
        {
            fieldName: 'type',
            name: getLocalString(this.props.context, 'Tag_Type_Title', 'Tag Type'),
            minWidth: 70,
            key: 'type',
            isResizable: true
        },
        {
            fieldName: 'taggedByName',
            name: getLocalString(this.props.context, 'Tagged_By_Title', 'Tagged By'),
            minWidth: 100,
            key: 'taggedByName',
            isResizable: true
        },
        {
            fieldName: 'createdon',
            name: getLocalString(this.props.context, 'Tagged_On_Title', 'Tagged On'),
            minWidth: 75,
            key: 'createdon',
            isResizable: true
        }
    ]
    private tagService: TagService

    constructor(props: ITagsListProps) {
        super(props)
        this.state = {
            context: this.props.context,
            entityId: this.props.context.parameters.Record_Id.raw || "",
            entityTypeName: this.props.context.parameters.Entity_Name.raw || "",
            tags: [],
            columns: this.columns
        }
        this.tagService = new TagService(this.props.context)
        this.onRenderItemColumn.bind(this)
        this.unlinkTag.bind(this)
    }

    private openRecord(entityId: string, entityName: string) {
        this.state.context.navigation.openForm({ entityId: entityId, entityName: entityName, openInNewWindow: true })
    }

    private unlinkTag(connectionId: string) {
        this.tagService.unlinkTag(connectionId).then(() => {
            const { tags } = this.state
            for (let i = 0; i < tags.length; i++) {
                if (tags[i].connectionid === connectionId) {
                    tags.splice(i, 1)
                }
            }
            this.setState({
                tags: [...tags]
            })
        })
    }

    private onRenderItemColumn(item?: Tag, index?: number | undefined, column?: IColumn | undefined): React.ReactNode {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content = item ? (item as any)[column?.fieldName as string] : ''

        const result =
            <span>{content}</span>


        const openForm = (recordId: string, entityName: string) => {
            if (item) {
                this.openRecord(recordId, entityName)
            }
        }

        switch (column?.fieldName) {
            case 'actions': {
                const target = `skyve_untag${item?.connectionid}`
                return <UntagFlyout key={`${target}_flyout`} tagName={item?.tagName || ''} onConfirm={() => {
                    this.unlinkTag(item?.connectionid as string)
                }
                } id={target} context={this.props.context} />
            }

            case 'tagName': return <Stack styles={{
                root: {
                    display: "inline-flex"
                }
            }} horizontal={true} tokens={{ childrenGap: 4 }}> {item?.entityimage ? <Image src={`data:image;base64,${item?.entityimage}`} height={30} width={30} /> : <Icon iconName={'Tag'} styles={{ root: { fontSize: 30 } }} />}
                <Link onClick={
                    () => {
                        if (item) openForm(item.tagId, 'skyve_tag')
                    }}>{content}</Link></Stack>

            case 'taggedByName': return <Link onClick={
                () => {
                    if (item) openForm(item.taggedBy, 'systemuser')
                }} >{content}</Link>

            case 'tagGroups': return <GroupsField key={`${item?.tagId}_groups`} tagId={item?.tagId} context={this.props.context} />

        }
        if (column?.fieldName !== 'actions') { return <TooltipHost overflowMode={TooltipOverflowMode.Parent} content={content} id={`${item?.tagId}_${column?.fieldName}_tooltip`} > {result}</TooltipHost> }
        else { return result }
    }

    public refreshTags() {
        this.tagService.getTagsForRecord(this.state.entityId).then((value) => {
            if (value.entities.length === 0) {
                this.setState((prevState: ITagsListState): ITagsListState => {
                    prevState.tags = []
                    return prevState
                })
            }
            else {
                const allowedScopes = GetAllowedScopes(this.props.context)
                const tags: Tag[] = []
                //@ts-ignore
                value.entities.map((entity: ConnectionRecord) => {
                    const item = {
                        tagName: entity['_record1id_value@OData.Community.Display.V1.FormattedValue'],
                        tagId: entity._record1id_value,
                        taggedBy: entity._createdby_value,
                        taggedByName: entity['_createdby_value@OData.Community.Display.V1.FormattedValue'],
                        connectionid: entity.connectionid,
                        type: entity.record1id_skyve_tag ? entity.record1id_skyve_tag['skyve_scope@OData.Community.Display.V1.FormattedValue'] : TagType.Public,
                        createdon: entity['createdon@OData.Community.Display.V1.FormattedValue'],
                        entityimage: entity.record1id_skyve_tag?.skyve_entityimage
                    }
                    if (allowedScopes.length === 0 || (!!entity.record1id_skyve_tag && allowedScopes.indexOf(entity.record1id_skyve_tag.skyve_scope)) >= 0) {
                        tags.push(item)
                    }
                })
                this.setState((oldState: ITagsListState) => {
                    oldState.tags = tags
                    return oldState
                })
            }
        })
    }

    //public componentWillReceiveProps(newProps: ITagsListProps): void {
    //    this.setState(newProps)
    //    console.log(newProps)
    //    this.refreshTags()
    //}

    public componentDidMount() {
        this.refreshTags()
    }
    private copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
        const key = columnKey as keyof T;
        return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
    }

    private onColumnClick = (event?: React.MouseEvent<HTMLElement>, column?: IColumn): void => {

        if (!column) {
            return
        }
        let { tags } = this.state;
        let isSortedDescending = column.isSortedDescending;

        // If we've sorted this column, flip it.
        if (column.isSorted) {
            isSortedDescending = !isSortedDescending;
        }

        // Sort the items.
        tags = this.copyAndSort(tags, column.fieldName||"", isSortedDescending);

        // Reset the items and columns to match the state.
        this.setState({
            tags: tags,
            columns: this.state.columns.map(col => {
                col.isSorted = col.key === column.key;

                if (col.isSorted) {
                    col.isSortedDescending = isSortedDescending;
                }
                return col;
            }),
        });
    };

    public render(): JSX.Element {
        return (
            <div className={"tagsList"}>
                <Stack>
                    <DetailsList
                        selectionMode={SelectionMode.none}
                        items={this.state.tags}
                        columns={this.state.columns}
                        onRenderItemColumn={(item, index, column) => this.onRenderItemColumn(item, index, column)}
                        onColumnHeaderClick={(e, c) => this.onColumnClick(e, c)}
                    ></DetailsList>
                </Stack>
            </div>)
    }
}