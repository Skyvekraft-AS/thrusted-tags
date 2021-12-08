import { mergeStyleSets, FontWeights } from '@fluentui/react/lib/Styling'
import { IconButton, PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button"
import { Stack } from "@fluentui/react/lib/Stack"
import { Text } from "@fluentui/react/lib/Text"
import * as React from 'react'
import { getLocalString } from '../../Utilities'
import { FocusZone } from '@fluentui/react/lib/FocusZone'
import { FocusTrapCallout } from '@fluentui/react/lib/Callout'

const styles = mergeStyleSets({
    buttonArea: {
        verticalAlign: 'top',
        display: 'inline-block',
        textAlign: 'center',
        margin: '0 100px',
        minWidth: 130,
        height: 32,
    },
    callout: {
        maxWidth: 300,
    },
    header: {
        padding: '18px 24px 12px',
    },
    title: [
        {
            margin: 0,
            fontWeight: FontWeights.semilight,
        },
    ],
    inner: {
        height: '100%',
        padding: '0 24px 20px',
    },
    actions: {
        position: 'relative',
        marginTop: 20,
        width: '100%',
        whiteSpace: 'nowrap',
    },
    buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: '0 24px 24px',
    },
    subtext: [
        {
            margin: 0,
            fontWeight: FontWeights.semilight,
        },
    ],
})
export const UntagFlyout: React.FunctionComponent<{ id: string, tagName: string, onConfirm: () => void, context: ComponentFramework.Context<any> }> = ({ onConfirm, id, tagName, context }) => {
    const [visible, setVisible] = React.useState(false)
    //   const target = `skyve_untag${item?.connectionid}`       
    const title = getLocalString(context, 'Untag_Title', 'Untag')
    const confirmBody = getLocalString(context, 'Confirm_Untag_Text', 'Confirm or Cancel removal of Tag:')
    const confirmButtonLabel = getLocalString(context, 'Confirm_Untag_Button_text', 'Confirm')
    const cancelButtonLabel = getLocalString(context, 'Cancel_Untag_Button_text', 'Cancel')

    return (<div>
        {visible ? <FocusTrapCallout
            role="alertdialog"
            gapSpace={0}
            target={`.${id}`}
            onDismiss={() => { setVisible(!visible) }}
            setInitialFocus
        >
            <div className={styles.header}>
                <Text className={styles.title}>{title}</Text>
            </div>
            <div className={styles.inner}>
                <div>
                    <Text className={styles.subtext}>
                        {confirmBody} '{tagName}'
                 </Text>
                </div>
            </div>
            <FocusZone>
                <Stack className={styles.buttons} gap={8} horizontal>
                    <PrimaryButton onClick={() => {
                        onConfirm()
                    }}>{confirmButtonLabel}</PrimaryButton>
                    <DefaultButton onClick={() => { setVisible(false) }}>{cancelButtonLabel}</DefaultButton>
                </Stack>
            </FocusZone>
        </FocusTrapCallout> : null}
        <IconButton className={id} iconProps={{ iconName: 'Untag', styles: { root: { fontSize: '24px' } } }} onClick={() => {
            setVisible(!visible)
        }} /></div>

    )
}