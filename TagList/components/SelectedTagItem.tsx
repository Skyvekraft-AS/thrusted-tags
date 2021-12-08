import { IPickerItemProps } from "@fluentui/react/lib/Pickers"
import { IButtonProps, IconButton } from "@fluentui/react/lib/Button"
import { Image } from "@fluentui/react/lib/Image"
import { Text } from "@fluentui/react/lib/Text"
import { Icon } from "@fluentui/react/lib/Icon"
import { HoverCard, HoverCardType, IPlainCardProps } from "@fluentui/react/lib/HoverCard"
import { TooltipHost } from "@fluentui/react/lib/Tooltip"
import { ICardTokens, ICardSectionStyles, ICardSectionTokens, Card } from "@fluentui/react-cards/lib/Card"
import { TagService } from "../../services/TagService"
import * as React from "react"
import { getLocalString } from "../../Utilities"
import { TagItem } from "../../types/TagItem"

export const SelectedTagItem: React.FunctionComponent<{ tagProps: IPickerItemProps<TagItem>, context: ComponentFramework.Context<any>, innerElement?: (tag: TagItem) => JSX.Element }> = (props) => {
    const [existsPersonal, setExistsPersonal] = React.useState(false)
    const [warning, setWarning] = React.useState<any>(null)
    const cardTokens: ICardTokens = { childrenMargin: 8, minWidth: 100, maxHeight: 80, height: 'auto' }
    const footerCardSectionStyles: ICardSectionStyles = {
        root: {
            alignSelf: 'stretch',
            borderLeft: '1px solid #F3F2F1',
            textAlign: 'center'
        },
    }
    const footerCardSectionTokens: ICardSectionTokens = { padding: '0px 0px 0px 6px' }
    const removeAction: IButtonProps = {
        iconProps: { iconName: 'Cancel' },
        onClick: (ev: any) => {
            if (props.tagProps.onRemoveItem) {
                props.tagProps.onRemoveItem()
            }
        }
    }
    if (props.tagProps.item.toCreate === true) {
        const tagService = new TagService(props.context)
        tagService.getTagsByFilter(`skyve_name eq '${props.tagProps.item.name.trim()}' and (skyve_scope eq 970380000 and _ownerid_value eq ${props.context.userSettings.userId})`).then((existing) => {
            if (existing && existing.entities && existing.entities.length > 0) {
                setExistsPersonal(true)
            }
        })
    }
    const tagExists = getLocalString(props.context, 'Tag_Exists_Message', 'Personal Tag with this name already exists. Make sure you do not create duplicates. Please note, that this record might have beeen already tagged.')
    const personalWillBeCreated = getLocalString(props.context, 'Tag_will_Be_Created_message', 'New personal Tag will be created')

    React.useEffect(() => {
        if (existsPersonal) {
            const onRenderPlainCard = (item: any): JSX.Element => {
                return <span>{tagExists}</span>
            }
            const hoverProps: IPlainCardProps = {
                onRenderPlainCard: onRenderPlainCard
            }
            setWarning(<Card.Section><HoverCard type={HoverCardType.plain} plainCardProps={hoverProps}>
                <Icon iconName={'TabTwoColumn'} styles={{ root: { color: '#cc6633', width: 25, height: 25, fontSize: 25 } }} />
            </HoverCard>
            </Card.Section>)
        }
        else {
            setWarning(null)
        }
    }, [existsPersonal])

    const imageSection = props.tagProps.item?.entityimage ? <Image src={`data:image;base64,${props.tagProps.item?.entityimage}`} height={25} width={25} /> :
        <Icon styles={{
            root: { width: 25, height: 25, fontSize: 25 },
        }} iconName={'Tag'} />
    const newIcon = <TooltipHost
        content={personalWillBeCreated}
        id={`${props.tagProps.item.key}_tooltip_add`}
    ><Icon styles={{
        root: { width: 25, height: 25, fontSize: 25, color: '#336600' },
    }} iconName={'CircleAddition'} /> </TooltipHost>

    return <Card tokens={cardTokens} horizontal>
        <Card.Section>
            {props.tagProps.item.toCreate !== true ? imageSection : newIcon}
        </Card.Section>
        {warning}
        <Card.Section>
            {props.innerElement ? props.innerElement(props.tagProps.item) : <Text>{props.tagProps.item.name}</Text>}
        </Card.Section>
        <Card.Section horizontal styles={footerCardSectionStyles} tokens={footerCardSectionTokens}>
            <IconButton styles={{ root: { height: 25 } }} {...(removeAction)} />
        </Card.Section>
    </Card>
}
