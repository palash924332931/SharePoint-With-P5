

import GenericModelService from '../../services/GenericModelService';
import GenericModelGeneration from '../GenericModelGeneration';
export default function sketch(p) {
  let rotation = 0;
  let pg;
  let canvas: any;
  let marginTop: number = 0;
  let marginBottom: number = 5;
  let marginLeft: number = GenericModelService.ModelSettings[0].metRenderStartingPosition || 5;
  let chevronFarEastPoint: number = GenericModelService.ModelSettings[0].metChevronFarEastPoint || 25;
  let polyganBorderColor: any = (GenericModelService.ModelSettings[0].metPolygonBorderColor) || 'transparent';
  let marginLeftForLevel: number = 0;
  let marginRight: number = 5;

  p.setup = function () {
    //p.createCanvas(600, 400, p.WEBGL);
    canvas = p.createCanvas(GenericModelService.CanvasX + marginLeft, GenericModelService.CanvasY);
    pg = p.createGraphics(GenericModelService.CanvasX + marginLeft, GenericModelService.CanvasY);
  };

  p.myCustomRedrawAccordingToNewPropsHandler = function (props) {
    if (props.rotation) {
      rotation = props.rotation * Math.PI / 180;
    }
  };

  p.draw = function () {
    let modelSettings = GenericModelService.ModelSettings || [];
    p.background('white');
    let yAxisPosition = marginTop;
    let elementCoordinateCollection: any[] = [];
    let DGActive: any[] = [];
    //#region  levels render
    let levels = fnSorting(GenericModelService.Levels, 'metLevelNumber', 'asc') || [];
    levels.forEach((rec: any) => {
      let height = rec.metLevelHeight;
      let backgroundColor = rec.metBackgroundColor == 'transparent' ? 'white' : rec.metBackgroundColor;
      let titleFontColor: any = rec.metTitleFontColor;
      
      p.fill(backgroundColor);
      p.rect(marginLeftForLevel, yAxisPosition, pg.width, height); //Draw rectangle
      if (rec.metHasBackgroundShape == 'true' || rec.metHasBackgroundShape == true) {
        let bgShapeWidth = pg.width;
        let bgShapeHeight = height;
        let backgroundShapeType = rec.metBackgroundShape;
        switch (backgroundShapeType) {
          case 'Diamond':
            let topPositionTop = yAxisPosition;
            bgShapeWidth = bgShapeWidth - chevronFarEastPoint - marginLeft;
            let dgHeight = Number(bgShapeHeight / 2);
            let dgWidth = Number(bgShapeWidth / 2);
            p.beginShape();
            p.fill(rec.metBackgroundShapeColor);
            p.vertex(marginLeft + dgWidth, topPositionTop);
            p.vertex(marginLeft + (dgWidth * 2), topPositionTop + dgHeight);
            p.vertex(marginLeft + dgWidth, topPositionTop + (dgHeight * 2));
            p.vertex(marginLeft, topPositionTop + dgHeight);
            p.endShape();
            break;
          case 'ClosedChevron':
            let shapeYAxisPosition = yAxisPosition;
            bgShapeWidth = bgShapeWidth - chevronFarEastPoint - marginLeft;
            p.beginShape();
            p.fill(rec.metBackgroundShapeColor);
            p.vertex(marginLeft, shapeYAxisPosition);
            p.vertex(marginLeft + bgShapeWidth, shapeYAxisPosition);
            p.vertex(marginLeft + bgShapeWidth + chevronFarEastPoint, shapeYAxisPosition + (bgShapeHeight / 2));
            p.vertex(marginLeft + bgShapeWidth, shapeYAxisPosition + bgShapeHeight);
            p.vertex(marginLeft, shapeYAxisPosition + bgShapeHeight);
            p.endShape();
            break;

          case "OpenChevron":
            shapeYAxisPosition = yAxisPosition;
            bgShapeWidth = bgShapeWidth - chevronFarEastPoint - marginLeft;
            p.beginShape();
            p.fill(rec.metBackgroundShapeColor);
            p.vertex(marginLeft, shapeYAxisPosition);
            p.vertex(marginLeft + bgShapeWidth, shapeYAxisPosition);
            p.vertex(marginLeft + bgShapeWidth + chevronFarEastPoint, shapeYAxisPosition + (bgShapeHeight / 2));
            p.vertex(marginLeft + bgShapeWidth, shapeYAxisPosition + bgShapeHeight);
            p.vertex(marginLeft, shapeYAxisPosition + bgShapeHeight);
            p.vertex(marginLeft + chevronFarEastPoint, shapeYAxisPosition + (bgShapeHeight / 2));
            p.endShape();
            break;

          case 'InverseTriangle':
            shapeYAxisPosition = yAxisPosition;
            bgShapeWidth = bgShapeWidth - chevronFarEastPoint - marginLeft;
            p.beginShape();
            p.fill(rec.metBackgroundShapeColor);
            p.vertex(marginLeft, shapeYAxisPosition);
            p.vertex(marginLeft + bgShapeWidth, shapeYAxisPosition);
            p.vertex(marginLeft + bgShapeWidth / 2, shapeYAxisPosition + bgShapeHeight);
            p.endShape();
            break;
        }

      }


      // to crate metHasDivisoryLine
      if (rec.metHasDivisoryLine == "true" || rec.metHasDivisoryLine == true) {
        p.beginShape();
        p.fill(rec.metDivisoryLineColor);
        p.rect(marginLeftForLevel, yAxisPosition + height - 2, pg.width, 2);
        p.endShape();
      }

      if (rec.metLevelTitleText != null && rec.metLevelTitleText != '') {
        p.fill(rec.metTitleFontColor);
        p.textAlign(p.CENTER);
        p.textSize(rec.metTitleFontSize);
        p.text(rec.metLevelTitleText, pg.width / 2 - 8, yAxisPosition + 18);
      }
      yAxisPosition = yAxisPosition + height;
      p.noStroke();

    });

    //#endregion levels

    //#region  element render
    let sortedElements = fnSorting(GenericModelService.Elements, 'metSequence', 'asc') || [];
    let elementXPositon = marginLeft;
    let elementYAxisPosition = marginTop;
    sortedElements.forEach((element: any) => {
      let height = 47;
      let width = element.metWidth || 0;
      let elementTopPositon = 0;
      let shapeType = element.metShape;
      let elementType = element.metElementType;
      let fontColor: any = 'white';
      let elementColor: any = element.metColor;
      let elementFontSize: number = 10;
      let elementBorderColor: any;
      let overlap: number = element.metOverlap || 0;

      if (elementType == 'Phase') {
        height = modelSettings[0].metPhaseHeight;
        width = width == 0 ? modelSettings[0].metPhaseWidth : width;
        elementFontSize = modelSettings[0].metPhaseFontSize;
        fontColor = modelSettings[0].metPhaseFontColor;
        element.ElementTopPosition.split(";").forEach((rec: any) => {
          if (rec.indexOf("phase") > -1) {
            elementTopPositon = Number(rec.split(":")[1] || 0);
          }
        });

       } else if (elementType == 'DecisionGate') {
        height = modelSettings[0].metDecisionGateHeight;
        width = width == 0 ? modelSettings[0].metDecisionGateWidth : width;
        elementTopPositon = modelSettings[0].metDecisionGateTopPosition;
        fontColor = modelSettings[0].metDecisionGateFontColor;
        elementFontSize = modelSettings[0].metDecisionGateFontSize;
       } else if (elementType == 'IterativeDecisionGate') {
        height = modelSettings[0].metDecisionGateHeight;
        width = width == 0 ? modelSettings[0].metDecisionGateWidth : width;
        elementTopPositon = modelSettings[0].metDecisionGateTopPosition;
        fontColor = modelSettings[0].metDecisionGateFontColor;
        elementFontSize = modelSettings[0].metDecisionGateFontSize;
      
      } else if (elementType == 'Milestone') {
        height = modelSettings[0].metMilestoneHeight;
        width = width == 0 ? modelSettings[0].metMilestoneWidth : width;
        elementFontSize = modelSettings[0].metMilestoneFontSize;
        fontColor = modelSettings[0].metMilestoneFontColor;
        elementBorderColor = modelSettings[0].metMilestoneFontColor;
        element.ElementTopPosition.split(";").forEach((rec: any) => {
          if (rec.indexOf("milestone") > -1) {
            elementTopPositon = Number(rec.split(":")[1] || 0);
          }
        });
      } else if (elementType == 'IterativePhase') {
        height = modelSettings[0].metPhaseHeight;
        width = width == 0 ? modelSettings[0].metPhaseWidth : width;
        elementFontSize = modelSettings[0].metPhaseFontSize;
        fontColor = modelSettings[0].metPhaseFontColor;
        element.ElementTopPosition.split(";").forEach((rec: any) => {
          if (rec.indexOf("phase") > -1) {
            elementTopPositon = Number(rec.split(":")[1] || 0);
          }
        });
      }





      //genrate shapes
      switch (shapeType) {
        case 'Diamond':
          let topPositionTop = elementTopPositon;
          //let dgSize = height / 2 + 5;
          let dgSize = height / 2;
          let dgWidth = width / 2;
          let centerX = 0;
          let centerY = 0;
          let diamondWidth = 0;
          elementXPositon = elementXPositon + overlap;
          p.beginShape();
          p.fill(elementColor);
          p.vertex(elementXPositon + dgSize, topPositionTop);
          p.vertex(elementXPositon + (dgSize * 2), topPositionTop + dgWidth);
          p.vertex(elementXPositon + dgSize, topPositionTop + (dgWidth * 2));
          p.vertex(elementXPositon, topPositionTop + dgWidth);
          polyganBorderColor == 'transparent' ? p.noStroke() : p.stroke(polyganBorderColor);
          p.endShape();
          p.fill(fontColor);
          p.textSize(elementFontSize);
          p.textAlign(p.CENTER);
          p.text(element.Title, elementXPositon + 17, topPositionTop + dgSize + 3);

          diamondWidth = dgSize * 2;
          centerX = elementXPositon + dgSize;
          centerY = topPositionTop + dgWidth;
          DGActive.push({startPositionX: elementXPositon,startPositionY:topPositionTop +5, DGWidth :diamondWidth});
          elementCoordinateCollection.push({ name: element.Title, x: centerX, y: centerY, distance: dgSize, link: element.metUrl, metElementId: element.ID });
          elementXPositon = elementXPositon + (dgWidth * 2);
          break;

        case "ClosedChevron":
          elementYAxisPosition = marginTop + element.StartPosition + elementTopPositon;
          elementXPositon = elementXPositon + overlap-chevronFarEastPoint;
          width = width - chevronFarEastPoint;
          //width = width + chevronFarEastPoint;
          p.beginShape();
          p.fill(elementColor);
          p.vertex(elementXPositon, elementYAxisPosition);
          p.vertex(elementXPositon + width, elementYAxisPosition);
          p.vertex(elementXPositon + width + chevronFarEastPoint, elementYAxisPosition + (height / 2));
          p.vertex(elementXPositon + width, elementYAxisPosition + height);
          p.vertex(elementXPositon, elementYAxisPosition + height);
          polyganBorderColor == 'transparent' ? p.noStroke() : p.stroke(polyganBorderColor);
          p.endShape();
          p.fill(fontColor);
          p.textSize(elementFontSize);
          p.textAlign(p.LEFT);
         // p.text(element.Title, elementXPositon + chevronFarEastPoint, elementYAxisPosition + (height / 2) - 5, width - chevronFarEastPoint, (height / 2));
          p.text(element.Title, elementXPositon + 5, elementYAxisPosition + (height / 2)-7, width - 5, (height / 2)+5);
          centerX = elementXPositon + (width + chevronFarEastPoint) / 2;
          centerY = elementYAxisPosition + (height / 2);
          elementCoordinateCollection.push({ name: element.Title, x: centerX, y: centerY, distance: height / 2, link: element.metUrl, metElementId: element.ID });
          //elementXPositon = elementXPositon + width;
          elementXPositon = elementXPositon + width+chevronFarEastPoint;
          break;

        case "OpenChevron":
          elementYAxisPosition = marginTop + element.StartPosition + elementTopPositon;
          elementXPositon = elementXPositon + overlap-chevronFarEastPoint;
          width = width - chevronFarEastPoint;
          //width = width + chevronFarEastPoint;
          p.beginShape();
          p.fill(elementColor);
          p.vertex(elementXPositon, elementYAxisPosition);
          p.vertex(elementXPositon + width, elementYAxisPosition);
          p.vertex(elementXPositon + width + chevronFarEastPoint, elementYAxisPosition + (height / 2));
          p.vertex(elementXPositon + width, elementYAxisPosition + height);
          p.vertex(elementXPositon, elementYAxisPosition + height);
          p.vertex(elementXPositon + chevronFarEastPoint, elementYAxisPosition + (height / 2));
          polyganBorderColor == 'transparent' ? p.noStroke() : p.stroke(polyganBorderColor);
          p.endShape();
          p.fill(fontColor);
          p.textSize(elementFontSize);
          p.textAlign(p.LEFT);
          //p.text(element.Title, elementXPositon + chevronFarEastPoint, elementYAxisPosition + (height / 2) - 5, width - chevronFarEastPoint, (height / 2));
          p.text(element.Title, elementXPositon + 25, elementYAxisPosition + (height / 2)-10, width - 20, (height / 2)+5);
          centerX = elementXPositon + (width + chevronFarEastPoint) / 2;
          centerY = elementYAxisPosition + (height / 2);
          elementCoordinateCollection.push({ name: element.Title, x: centerX, y: centerY, distance: height / 2, link: element.metUrl, metElementId: element.ID });
          //elementXPositon = elementXPositon + width;
          elementXPositon = elementXPositon + width+chevronFarEastPoint;
          break;

        case 'InverseTriangle':
          elementYAxisPosition = marginTop + element.StartPosition + elementTopPositon;
          elementXPositon = elementXPositon + overlap;
          p.beginShape();
          p.fill(elementColor);
          p.vertex(elementXPositon, elementYAxisPosition);
          p.vertex(elementXPositon + width, elementYAxisPosition);
          p.vertex(elementXPositon + width / 2, elementYAxisPosition + height);
          polyganBorderColor == 'transparent' ? p.noStroke() : p.stroke(polyganBorderColor);
          p.endShape();
          p.fill(fontColor);
          p.textSize(elementFontSize);
          p.textAlign(p.LEFT);
          //p.text(element.Title, elementXPositon + 6, elementYAxisPosition+10,width-1,(height/2));
          centerX = elementXPositon + (width) / 2;
          centerY = elementYAxisPosition + (height / 2);
          elementCoordinateCollection.push({ name: element.Title, x: centerX, y: centerY, distance: height / 2, link: element.metUrl, metElementId: element.ID });
         // p.text(element.Title, elementXPositon + 6, elementYAxisPosition + 10);
          p.text(element.Title, elementXPositon + 10, elementYAxisPosition + 10);
          elementXPositon = elementXPositon + width;
          break;
      }

      console.log("elementType : ", elementType,'Name: ',element.Title, "overlap: ", overlap, "height : ", height, "width: ", width, "elementTopPositon : ", elementTopPositon, " elementXPositon: ", elementXPositon);

    });
    
    
    
    //#endregion elements
    p.mouseClicked = function () {
      console.log(p.mouseY, 'X: ', p.mouseX);
      console.log(elementCoordinateCollection);
      let erxpectedClickableItems: any = null;
      let distance = 1000;
      elementCoordinateCollection.every((rec: any) => {
        let d = Math.sqrt(Math.pow(p.mouseX - rec.x, 2) + Math.pow(p.mouseY - rec.y, 2));
        if (d < distance && d < 55) {
          erxpectedClickableItems = rec;
        }
        return true
      });

      if (erxpectedClickableItems != null) {
        let param = "FilterField1=metElementId&FilterValue1=" + erxpectedClickableItems.metElementId + "&targetId=0&_metElementId=" + erxpectedClickableItems.metElementId + "&modelId=" + GenericModelService.ModelId;
        console.log("clicked to redirect..");

        let url = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + erxpectedClickableItems.link + '?' + param;
        console.log(url);
        window.open(url);
        //window.location.href = url;
        // window.open(window.location.host + window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1) + erxpectedClickableItems.link + '?' + param);
        return false;
      }
    }

    p.noStroke();
    p.noLoop();
  };

  function fnSorting(dataSet: any[], columns: any, orderType: string) {
    let resultDataSet: any[] = [];
    if (orderType == 'desc') {
      resultDataSet = dataSet.sort((n1, n2) => {
        if (n1[columns] < n2[columns]) { return 1; }
        if (n1[columns] > n2[columns]) { return -1; }
        return 0;
      });

    } else {
      resultDataSet = dataSet.sort((n1, n2) => {
        if (n1[columns] > n2[columns]) { return 1; }
        if (n1[columns] < n2[columns]) { return -1; }
        return 0;
      });
    }

    return resultDataSet;
  }


};
