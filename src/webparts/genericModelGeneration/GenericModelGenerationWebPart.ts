import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  BaseClientSideWebPart,
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneSlider,
  PropertyPaneDropdown,
  PropertyPaneCheckbox
} from '@microsoft/sp-webpart-base';

import * as strings from 'GenericModelGenerationWebPartStrings';
import GenericModelGeneration from './components/GenericModelGeneration';
import { IGenericModelGenerationProps } from './components/IGenericModelGenerationProps';
import { SPComponentLoader } from '@microsoft/sp-loader';
import WebpartPropertiesCustomValue from './services/WebpartPropertiesValues';
import Service from './services/GenericModelService';

export interface IGenericModelGenerationWebPartProps {
  wpTitle: string;
  modelSize: number;
  modelTypeSelection: string;
  isShowDescription: string;
  isProjectRoom: boolean;
  navigationModelPosition: string;
  navigationHiddenInMobileWindow: string;
  context: any;
  titleOfModel: string;
  titleOfProcess: string;
}

export default class GenericModelGenerationWebPart extends BaseClientSideWebPart<IGenericModelGenerationWebPartProps> {
  
  public render(): void {
    SPComponentLoader.loadCss('https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css');
    SPComponentLoader.loadCss('https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css');
   
    const element: React.ReactElement<IGenericModelGenerationProps> = React.createElement(
      GenericModelGeneration,
      {
        wpTitle: this.properties.wpTitle||strings.DefaultWebpartTitle,
        modelSize: this.properties.modelSize || 100,
        modelTypeSelection: this.properties.modelTypeSelection || "",
        isShowDescription: this.properties.isShowDescription || 'Yes',
        isProjectRoom: this.properties.isProjectRoom || false,
        navigationModelPosition: this.properties.navigationModelPosition || "left",
        navigationHiddenInMobileWindow: this.properties.navigationHiddenInMobileWindow || "No",
        context: this.context,
        titleOfModel: this.properties.titleOfModel || "Model",
        titleOfProcess: this.properties.titleOfProcess || "Process"
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    let templatePropertyModel: any;
    let templatePropertyProcess: any;
    if (this.properties.modelTypeSelection == "3") {
      templatePropertyModel = PropertyPaneTextField('titleOfModel', {
        label: strings.PropPaneTitleOfModelInNavigation
      });
      templatePropertyProcess = PropertyPaneTextField('titleOfProcess', {
        label: strings.PropPaneTitleOfProcessInNavigation
      });
    } else {
      templatePropertyModel = [];
      templatePropertyProcess = [];
    }

    return {
      pages: [
        {
          header: {
            description: ""
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('wpTitle', {
                  label: strings.PropPaneProjectModelTitle
                }),
                PropertyPaneDropdown('modelTypeSelection', {
                  label: strings.PropPaneSelectModelTypeTitle,
                  options: WebpartPropertiesCustomValue.modelTypeSelectionList
                }),
                PropertyPaneSlider('modelSize', {
                  label: strings.PropPaneSetModelSizeTitle,
                  min: 25,
                  max: 100,
                  value: this.properties.modelSize || 100,
                  showValue: true,
                  step: 1
                }),
                PropertyPaneDropdown('isShowDescription', {
                  label: strings.PropPaneShowDescriptionTitle,
                  options: WebpartPropertiesCustomValue.showProjectDescritionProperty
                }),
                PropertyPaneCheckbox('isProjectRoom', {
                  text: strings.PropPaneInProjectRoomTitle,
                  checked: false,
                  disabled: false
                }),

                PropertyPaneDropdown('navigationModelPosition', {
                  label: strings.PropPaneSetNavigationModelPosition,
                  options: WebpartPropertiesCustomValue.modelPositionPropetyList
                }),

                PropertyPaneDropdown('navigationHiddenInMobileWindow', {
                  label: strings.PropPaneHideInMobileDevice,
                  options: WebpartPropertiesCustomValue.hiddenPropertyInMobile
                }),
                templatePropertyModel,
                templatePropertyProcess
              ]
            }
          ]
        }
      ]
    };
  }
}
