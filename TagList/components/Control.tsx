import * as React from "react"
import { IInputs } from "../generated/ManifestTypes";
import { TagsListControl } from "./TagsListControl";
import { Stack } from "@fluentui/react/lib/Stack";
import { Picker } from "./Picker";

export interface IControlProps {
    context: ComponentFramework.Context<IInputs>
}

export interface IConstrolState extends React.ComponentState, IControlProps {

}

export class Control extends React.Component<IControlProps, IConstrolState> {
    tagListControl= React.createRef<TagsListControl>()
    constructor(props:IControlProps){
        super(props)

    }
    render(): JSX.Element {
        const entityId = this.props.context.parameters.Record_Id.raw||""
        const entityTypeName = this.props.context.parameters.Entity_Name.raw || ""
        const onAdd=()=>{
            this.tagListControl.current?.refreshTags()
        }
        return (
            <div className={"control"}>
                <Stack>
                    <Picker showAdd={true} context={this.props.context} entityId={entityId} entityTypeName={entityTypeName} onAdded={()=>{onAdd()}} />
                    <TagsListControl ref={this.tagListControl} context={this.props.context} entityId={entityId} entityTypeName={entityTypeName}></TagsListControl>
                </Stack>
            </div>
        )

    }
}