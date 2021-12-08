var Skyve = {
    Views: {
        Buttons: {
            AddTags: {
                Click: function (primaryControl, selectedControlSelectedItemReferences, primaryEntityTypeName) {
                    var formContext = (Xrm).Internal.isUci() ? primaryControl : primaryControl.getFormContext()
                    var data = {
                        currentUserId: Xrm.Utility.getGlobalContext().getUserId(),
                        entityName: primaryEntityTypeName,
                        selectedrecords: []
                    }
                    
                    Xrm.Utility.getEntityMetadata(primaryEntityTypeName).then((metadata) => {
                        selectedControlSelectedItemReferences.forEach(element => {
                            data.selectedrecords.push({ entityTypeName: element.TypeName, entityId: element.Id, entitySetName: metadata.EntitySetName })
                        });
                        Xrm.Navigation.navigateTo({ pageType: 'webresource', webresourceName: 'skyve_/bulktag/html/index.html', data: JSON.stringify(data) }, { position: 1, target: 2, width: 800, height: 400 })
                    })

                },
                Enabled: function (primaryControl) {
                    var formContext = (Xrm).Internal.isUci() ? primaryControl : primaryControl.getFormContext();
                    var entityName = formContext.getEntityName();
                    return Xrm.Utility.getEntityMetadata(entityName).then((metadata) => {
                        return metadata.IsConnectionsEnabled;
                    })
                }
            }
        }

    }

}