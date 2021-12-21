import * as  React from "react"
import { Image } from "@fluentui/react/lib/Image"
import { Icon } from "@fluentui/react/lib/Icon"

export const TagImage: React.FC<{ entityImage?: string }> = ({ entityImage }) => {
    return (entityImage ? <Image src={`data:image;base64,${entityImage}`} height={25} width={25} /> :
        <Icon styles={{
            root: { width: 25, height: 25, fontSize: 25 },
        }} iconName={'Tag'} />
    );
}

