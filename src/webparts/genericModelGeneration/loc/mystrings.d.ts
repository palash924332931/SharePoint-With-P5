declare interface IGenericModelGenerationWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  PropPaneProjectModelTitle:string;
  PropPaneSelectModelTypeTitle:string;
  PropPaneSetModelSizeTitle:string;
  PropPaneShowDescriptionTitle:string;
  PropPaneInProjectRoomTitle:string;
  PropPaneSetNavigationModelPosition:string;
  PropPaneHideInMobileDevice:string;
  PropPaneTitleOfModelInNavigation:string;
  PropPaneTitleOfProcessInNavigation:string;
  ShowProjectModelTitle:string;
  ShowProjectModelTitleInProcess:string;
  PleaseSelectTitle:string;
  ModelTypeDDValueShowProjectModelLabel:string,
  ModelTypeDDValueProjectModelNavLabel:string,
  ModelTypeDDValueShowProjectProcessLabel:string,
  YesLable:string;
  NoLabel:string;
  LeftLable:string;
  RightLabel:string;
  DefaultWebpartTitle:string;
}

declare module 'GenericModelGenerationWebPartStrings' {
  const strings: IGenericModelGenerationWebPartStrings;
  export = strings;
}
