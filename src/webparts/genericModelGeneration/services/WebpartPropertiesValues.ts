
import * as strings from 'GenericModelGenerationWebPartStrings';

export class WebpartPropertiesCustomValue {
    public static modelTypeSelectionList = [
        { key: 1, text: strings.ModelTypeDDValueShowProjectModelLabel },
        { key: 2, text: strings.ModelTypeDDValueProjectModelNavLabel },
       // { key: 3, text: strings.ModelTypeDDValueShowProjectProcessLabel }
    ];

    public static modelPositionPropetyList=[
        { key: "left", text: strings.LeftLable },
        { key: "right", text: strings.RightLabel }
      ];

      public static hiddenPropertyInMobile=[
        { key: "Yes", text: strings.YesLable },
        { key: "No", text: strings.NoLabel}
      ];

      public static showProjectDescritionProperty=[
        { key: 1, text: strings.YesLable },
        { key: 2, text: strings.NoLabel }
      ];
}

export default WebpartPropertiesCustomValue;