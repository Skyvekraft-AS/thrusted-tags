import * as React from "react"
import {
    TagPicker, ITag, ITagPickerProps, BasePicker,
    IBasePickerState, ISuggestionItemProps, IBasePickerSuggestionsProps, ValidationState
} from '@fluentui/react/lib/Pickers'
import { Stack } from '@fluentui/react/lib/Stack'
import { IconButton, BaseButton, Button } from '@fluentui/react/lib/Button'
import { TagService } from "../../services/TagService"
import { SelectedTagItem } from "../components/SelectedTagItem"
import { EntityToTagItem, getLocalString } from "../../Utilities"
import { GetAllowedScopes } from "../../InputUtils"
import { TagItem } from "../../types/TagItem"

export interface IPickerProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: ComponentFramework.Context<any>
    entityId: string;
    entityTypeName: string;
    onAdded: () => void;
    existingTags?: TagItem[]
    pickerKey?: string
    onRemove?: (tag: TagItem) => void
    onSelected?: (tag?: TagItem) => TagItem | PromiseLike<TagItem> | null
    showAdd: boolean
    innerElement?: (tag: TagItem) => JSX.Element
}

export interface IPickerState extends React.ComponentState {
    newtags: ITag[]
    currentInput: string
    pickerKey: string
}

export class Picker extends React.Component<IPickerProps, IPickerState> {

    private tagService: TagService
    private tagPicker = React.createRef<BasePicker<ITag, ITagPickerProps>>()
    private allowedScopes: number[]

    constructor(props: IPickerProps) {
        super(props)
        this.onResolveSggestions.bind(this)
        this.addTags.bind(this)
        this.resolveTagWithText.bind(this)
        this.onValidateInput.bind(this)
        this.onSelectedTagsChange.bind(this)
        this.tagService = new TagService(this.props.context)
        this.allowedScopes = GetAllowedScopes(this.props.context)
        this.state = {
            newtags: [],
            currentInput: '',
            pickerKey: this.props.pickerKey || 'pickerKey_'
        }
    }

    private onResolveSggestions(filterText: string, selectedItems?: TagItem[]): PromiseLike<TagItem[]> | TagItem[] {
        return this.tagService.getTagsForRecord(this.props.entityId).then((existingTags) => {
            let excludeFilter = ''
            let scopeFilter = ''

            this.allowedScopes.map(
                (scope: number) => {
                    scopeFilter = scopeFilter + (scopeFilter ? ` or skyve_scope eq ${scope}` : `skyve_scope eq ${scope}`)
                    return scope

                })
            scopeFilter = scopeFilter ? ` and (${scopeFilter})` : scopeFilter
            if (existingTags.entities.length > 0) {
                existingTags.entities.map((currentValue) => {
                    excludeFilter = ` ${excludeFilter} and (skyve_tagid ne ${currentValue._record1id_value} or (skyve_duplication eq 823220000))`
                    return currentValue
                })
            }

            if (selectedItems && selectedItems?.length > 0) {
                selectedItems.map((currentValue) => {
                    if (currentValue.toCreate !== true) {
                        excludeFilter = ` ${excludeFilter} and (skyve_tagid ne ${currentValue.key})`
                    }
                    return currentValue
                })
            }

            return this.tagService.getTagsByFilter(`contains(skyve_name, '${filterText}') ${excludeFilter} ${scopeFilter} and (skyve_scope ne 970380000 or _ownerid_value eq ${this.props.context.userSettings.userId})`)
                .then((results) => {
                    return results.entities.map((x) => EntityToTagItem(x))
                })
        })
    }

    private addTags(event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement | BaseButton | Button | HTMLSpanElement, MouseEvent>) {
        console.log(event)
        if (this.tagPicker.current) {
            this.props.context.utils.getEntityMetadata(this.props.entityTypeName)
                .then((entityMeta) => {
                    if (this.tagPicker.current) {
                        this.tagService.createTags(this.tagPicker.current?.items as TagItem[], this.props.entityId, entityMeta).then(
                            () => this.props.onAdded()
                        )
                    }
                }).finally(() => {
                    if (this.tagPicker.current) {
                        this.tagPicker.current.setState((state: IBasePickerState<ITag>) => {
                            state.items = []
                            return state
                        })
                        this.setState({
                            newtags: []
                        })
                    }
                })
        }

    }

    private onValidateInput(input: string): ValidationState {
        if (input.length < 3) {
            return ValidationState.invalid
        }
        else {
            return ValidationState.valid
        }
    }

    private resolveTagWithText(input: string, state: ValidationState): TagItem {
        const newTag = {
            name: input,
            key: input,
            tagType: 'Personal',
            createdBy: this.props.context.userSettings.userName,
            toCreate: true
        }

        const nowState = this.state.newtags

        nowState.push(newTag)

        this.setState({
            newtags: [...nowState]
        })

        return newTag
    }

    private renderSuggestionTag(props: TagItem, itemProps: ISuggestionItemProps<TagItem>): JSX.Element {
        return (<Stack key={`suggetedItem_${props.key}`} horizontal={true} tokens={{ childrenGap: 8 }}>
            <span style={{ width: 150, margin: 4, padding: 4, textAlign: "left", fontWeight: 600 }}>{props.name}</span>
            <span style={{ width: 140, margin: 4, padding: 4, textAlign: "left" }}>{props.groups}</span>
            <span style={{ width: 95, margin: 4, padding: 4, textAlign: "left" }}> {props.tagType}</span>
            <span style={{ width: 120, margin: 4, padding: 4, textAlign: "left" }}>{props.createdBy}</span>
        </Stack>)
    }

    private getNewtags(): ITag[] {
        const newTags: ITag[] = []
        if (this.tagPicker && this.tagPicker.current && this.tagPicker.current.items.length > 0) {
            for (const tag of this.tagPicker.current.items) {
                if ((tag as TagItem).toCreate === true) {
                    newTags.push(tag)
                }
            }
        }
        return newTags
    }

    private onSelectedTagsChange(tags: ITag[] | undefined) {
        if (!tags || tags.length === 0) {
            this.setState({
                newtags: []
            })
            return
        }
        this.setState({
            newtags: this.getNewtags()
        })
    }

    public render(): JSX.Element {

        const suggestedTags = getLocalString(this.props.context, 'Suggested_Tags_Text', 'Suggested Tags (Name, Groups, Type, Owner)')
        const forseResolveText = getLocalString(this.props.context, 'Force_Resolve_Text', 'Create new personal Tag?')
        const searchPlaceHolder = getLocalString(this.props.context, 'Search_Placeholder_Text', 'Type here to search for existing tags...')

        const pickerProps: IBasePickerSuggestionsProps = {
            suggestionsHeaderText: suggestedTags,
            forceResolveText: forseResolveText,
            showForceResolve: () => {
                if (this.tagPicker && this.tagPicker.current) {
                    if (this.allowedScopes.indexOf(970380000) < 0) {
                        return false
                    }
                    return !!this.tagPicker && this.onValidateInput(this.state.currentInput) === ValidationState.valid
                }
                else { return false }
            }
        }
       
        return (
            <Stack>
                <Stack horizontal={true}>
                    <TagPicker
                        inputProps={{ placeholder: searchPlaceHolder }}
                        resolveDelay={500}
                        selectedItems={this.props.existingTags}
                        key={this.state.pickerKey}
                        onInputChange={(input) => {
                            this.setState({
                                currentInput: input
                            })
                            return input
                        }}
                        onChange={(tags?: ITag[]) => {
                            this.onSelectedTagsChange(tags)
                        }}
                        onValidateInput={(input) => { return this.onValidateInput(input) }}
                        createGenericItem={(input, state) => { return this.resolveTagWithText(input, state) }}
                        pickerSuggestionsProps={pickerProps}
                        componentRef={this.tagPicker}
                        itemLimit={100}
                        getTextFromItem={(item: ITag) => { return item.name }}
                        onRenderSuggestionsItem={this.renderSuggestionTag}
                        onResolveSuggestions={(x, y) => { return this.onResolveSggestions(x, y) }}
                        onItemSelected={this.props.onSelected}
                        onRenderItem={(props) => {
                            return (<SelectedTagItem
                                innerElement={this.props.innerElement}
                                tagProps={{
                                    ...props, onRemoveItem: this.props.onRemove ?
                                        () => {
                                            this.props.onRemove ? this.props.onRemove(props.item as TagItem) : null
                                        } : props.onRemoveItem
                                }} context={this.props.context} />)
                        }}
                    />
                    {this.props.showAdd ? <IconButton iconProps={{ iconName: 'Add' }} onClick={(event) => { this.addTags(event) }}></IconButton> : null}
                </Stack>
            </Stack>)
    }


}