import * as React from "react"
import { Link } from '@fluentui/react/lib/Link'
import { TagService } from "../../services/TagService";

export const GroupsField: React.FunctionComponent<{ tagId?: string, context: ComponentFramework.Context<any> }> = ({ tagId, context }) => {
    const tagSevice = new TagService(context)

    const [groups, setGroups] = React.useState<ComponentFramework.WebApi.Entity[]>([])
    if(!tagId){
        return null
    }
    React.useEffect(()=>{
        tagSevice.getTagGroups(tagId).then((result) => {
            setGroups(result)
        })
    },[])    

    return (<div>
        {groups.map((value) => {
            return <Link onClick={() => {
                context.navigation.openForm({entityId: value['skyve_taggroupid'], entityName: 'skyve_taggroup', openInNewWindow:true})
            }} >{value['skyve_name']}</Link>
        })}
    </div>)
}