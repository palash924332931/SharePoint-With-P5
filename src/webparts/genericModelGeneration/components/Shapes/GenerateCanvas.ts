

import GenericModelService from '../../services/GenericModelService';
export default function sketch(p) {
  let rotation = 0;
  let pg;
  let canvas: any;
  let marginTop: number = 0;
  let marginBottom: number = 5;
  let marginLeft: number = GenericModelService.ModelSettings[0].metRenderStartingPosition || 5;
  let chevronFarEastPoint: number = GenericModelService.ModelSettings[0].metChevronFarEastPoint || 0;
  let polyganBorderColor: any = (GenericModelService.ModelSettings[0].metPolygonBorderColor) || 'transparent';
  let marginLeftForLevel: number = 0;
  let marginRight: number = 5;
  let erxpectedClickableItems: any = null;
  let canvasWidth: number = GenericModelService.CanvasX + marginLeft;
  let canvasHeight: number = GenericModelService.CanvasY;
  let modelRatio: number = 1;
  let hoverElement: any = {
    name: "",
    hover: null,
    cursorPointer: null
  };

  //#region setup section
  p.setup = () => {
    //setup the canvas display
    //p.createCanvas(600, 400, p.WEBGL);
    canvas = p.createCanvas(GenericModelService.CanvasX + marginLeft, GenericModelService.CanvasY);
    pg = p.createGraphics(GenericModelService.CanvasX + marginLeft, GenericModelService.CanvasY);
    modelRatio = ((GenericModelService.modelSize / 100) || 1);

    //to resize the canvas
    setTimeout(() => {
      var evt = window.document.createEvent('UIEvents');
      evt.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(evt);
    }, 700);
  };
  //#endregion set up section

  p.myCustomRedrawAccordingToNewPropsHandler = (props) => {
    if (props.rotation) {
      rotation = props.rotation * Math.PI / 180;
    }
  };



  p.draw = () => {
    p.scale(Number(modelRatio), Number(modelRatio));
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
      // rendering title text with exact position and llignment
      generateText(rec, yAxisPosition, height, marginLeft, pg);

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

        elementYAxisPosition = marginTop + element.StartPosition + elementTopPositon;

      } else if (elementType == 'DecisionGate') {
        height = modelSettings[0].metDecisionGateHeight;
        width = width == 0 ? modelSettings[0].metDecisionGateWidth : width;
        elementTopPositon = modelSettings[0].metDecisionGateTopPosition;
        fontColor = modelSettings[0].metDecisionGateFontColor;
        elementFontSize = modelSettings[0].metDecisionGateFontSize;
        elementYAxisPosition = elementTopPositon;

        //to set the approved rejected color
        let sleectedDGStatus = GenericModelService.ElementStatus.filter((rec: any) => element.Id == rec.metTargetElement.ID) || [];
        if (sleectedDGStatus.length > 0) {
          if (sleectedDGStatus[0].metStatus == "Rejected") {
            elementColor = modelSettings[0].metDGColorRejected;
          } else if (sleectedDGStatus[0].metStatus == "Approved") {
            elementColor = modelSettings[0].metDGColorApproved;
          } else if (sleectedDGStatus[0].metStatus == "Requested") {
            elementColor = modelSettings[0].metDGColorRequested;
          }
        }


      } else if (elementType == 'IterativeDecisionGate') {
        height = modelSettings[0].metDecisionGateHeight;
        width = width == 0 ? modelSettings[0].metDecisionGateWidth : width;
        elementTopPositon = modelSettings[0].metDecisionGateTopPosition;
        fontColor = modelSettings[0].metDecisionGateFontColor;
        elementFontSize = modelSettings[0].metDecisionGateFontSize;
        elementYAxisPosition = elementTopPositon;

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
        elementYAxisPosition = marginTop + element.StartPosition + elementTopPositon;
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
        elementYAxisPosition = marginTop + element.StartPosition + elementTopPositon;
      }

      //to set the selected Color
      if (GenericModelService.seletedMetElementId > 0 && GenericModelService.seletedMetElementId == element.Id) {
        elementColor = modelSettings[0].metElementColorSelected;
      }
      let from = p.color(elementColor);
      let to = p.color("white");

      //#region  generate shape types
      switch (shapeType) {
        case 'Diamond':
          let topPositionTop = elementYAxisPosition;
          //let dgSize = height / 2 + 5;
          let dgSize = height / 2;
          let dgWidth = width / 2;
          let centerX = 0;
          let centerY = 0;
          let diamondWidth = 0;
          elementXPositon = elementXPositon + overlap;
          p.beginShape();
          hoverElement.name == element.Title && hoverElement.hover ? p.fill(p.lerpColor(from, to, 0.5)) : p.fill(elementColor);
          p.vertex(elementXPositon + dgSize, topPositionTop);
          p.vertex(elementXPositon + (dgSize * 2), topPositionTop + dgWidth);
          p.vertex(elementXPositon + dgSize, topPositionTop + (dgWidth * 2));
          p.vertex(elementXPositon, topPositionTop + dgWidth);
          polyganBorderColor == 'transparent' ? p.noStroke() : p.stroke(polyganBorderColor);
          p.endShape();
          p.fill(fontColor);
          p.textSize(elementFontSize);
          p.textAlign(p.CENTER);
          p.text(element.Title, elementXPositon + dgSize, topPositionTop + dgSize + 3);

          diamondWidth = dgSize * 2;
          centerX = elementXPositon + dgSize;
          centerY = topPositionTop + dgWidth;
          DGActive.push({ startPositionX: elementXPositon, startPositionY: topPositionTop + 5, DGWidth: diamondWidth });
          elementCoordinateCollection.push({
            name: element.Title, x: centerX, y: centerY, distance: dgSize, link: element.metUrl, metElementId: element.ID, metElementType: element.metElementType, metSequence: element.metSequence,shapeType: shapeType,
            Active: { startPositionX: elementXPositon, startPositionY: topPositionTop + 5, Width: diamondWidth, Height: diamondWidth, Hover: null }
          });
          elementXPositon = elementXPositon + (dgWidth * 2);
          break;

        case "ClosedChevron":
          elementXPositon = elementXPositon + overlap;
          width = width - chevronFarEastPoint;
          p.beginShape();
          hoverElement.name == element.Title && hoverElement.hover ? p.fill(p.lerpColor(from, to, 0.25)) : p.fill(elementColor);
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
          element.Title.length > width - 5 ?
            p.text(element.Title, elementXPositon + 5, elementYAxisPosition + (height / 2) - (height / 4), width - 5, (height / 2) + 5)
            :
            p.text(element.Title, elementXPositon + 5, elementYAxisPosition + (height / 2) - (height / 6), width - 5, (height / 2) + 5);
          centerX = elementXPositon + (width + chevronFarEastPoint) / 2;
          centerY = elementYAxisPosition + (height / 2);
          elementCoordinateCollection.push({
            name: element.Title, x: centerX, y: centerY, distance: height / 2, link: element.metUrl, metElementId: element.ID, metElementType: element.metElementType, metSequence: element.metSequence,shapeType: shapeType,
            Active: { startPositionX: elementXPositon, startPositionY: elementYAxisPosition, Width: width + 2, Height: height, Hover: null }
          });
          elementXPositon = elementXPositon + width + chevronFarEastPoint;
          break;

        case "OpenChevron":
          elementYAxisPosition = marginTop + element.StartPosition + elementTopPositon;
          elementXPositon = elementXPositon + overlap;
          width = width - chevronFarEastPoint;
          p.beginShape();
          //p.fill(elementColor);
          hoverElement.name == element.Title && hoverElement.hover ? p.fill(p.lerpColor(from, to, 0.25)) : p.fill(elementColor);
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
          (element.Title || "").length > width - 5 ?
            p.text(element.Title, elementXPositon + chevronFarEastPoint + 2, elementYAxisPosition + (height / 2) - (height / 4) + 1, width - chevronFarEastPoint, (height / 2) + 5)
            :
            p.text(element.Title, elementXPositon + chevronFarEastPoint + 4, elementYAxisPosition + (height / 2) - (height / 4) + 7, width - 20, (height / 2) + 5);
          // p.text(element.Title, elementXPositon + 25, elementYAxisPosition + (height / 2) - 10, width - 20, (height / 2) + 5);
          centerX = elementXPositon + (width + chevronFarEastPoint) / 2;
          centerY = elementYAxisPosition + (height / 2);
          elementCoordinateCollection.push({
            name: element.Title, x: centerX, y: centerY, distance: height / 2, link: element.metUrl, metElementId: element.ID, metElementType: element.metElementType, metSequence: element.metSequence,shapeType: shapeType,
            Active: { startPositionX: elementXPositon, startPositionY: elementYAxisPosition, Width: width + 2, Height: height, Hover: null }
          });

          //elementXPositon = elementXPositon + width;
          elementXPositon = elementXPositon + width + chevronFarEastPoint;
          break;

        case 'InverseTriangle':
          elementYAxisPosition = marginTop + element.StartPosition + elementTopPositon;
          elementXPositon = elementXPositon + overlap;
          p.beginShape();
          //p.fill(elementColor);
          hoverElement.name == element.Title && hoverElement.hover ? p.fill(p.lerpColor(from, to, 0.25)) : p.fill(elementColor);
          p.vertex(elementXPositon, elementYAxisPosition);
          p.vertex(elementXPositon + width, elementYAxisPosition);
          p.vertex(elementXPositon + width / 2, elementYAxisPosition + height);
          polyganBorderColor == 'transparent' ? p.noStroke() : p.stroke(polyganBorderColor);
          p.endShape();
          p.fill(fontColor);
          p.textSize(elementFontSize);
          p.textAlign(p.CENTER);
          centerX = elementXPositon + (width) / 2;
          centerY = elementYAxisPosition + (height / 2);
          //p.text(element.Title, elementXPositon + 10, elementYAxisPosition + 10);
          p.text(element.Title, centerX, centerY);
          elementCoordinateCollection.push({
            name: element.Title, x: centerX, y: centerY, distance: height / 2, link: element.metUrl, metElementId: element.ID, metElementType: element.metElementType, metSequence: element.metSequence, shapeType: shapeType,
            Active: { startPositionX: elementXPositon, startPositionY: elementYAxisPosition, Width: width, Height: height, Hover: null }
          });
          elementXPositon = elementXPositon + width;
          break;
      }
      //#endregion generate shape types


      //console.log("elementType : ", elementType, 'Name: ', element.Title, "overlap: ", overlap, "height : ", height, "width: ", width, "elementTopPositon : ", elementTopPositon, " elementXPositon: ", elementXPositon);

    });
    //#endregion elements


    //#region mouse functoin 
    p.mouseMoved = () => {
      let distance = 1000;
      let mouseX = Number(p.mouseX) * Number(1 / Number(modelRatio));
      let mouseY = Number(p.mouseY) * Number(1 / Number(modelRatio));
      elementCoordinateCollection.every((rec: any) => {
        if ((rec.shapeType == "Diamond" || rec.shapeType == "InverseTriangle")) {
          let d = Math.sqrt(Math.pow(mouseX - rec.x, 2) + Math.pow(mouseY - rec.y, 2));
          if (d < distance && d < 55) {
            erxpectedClickableItems = rec;
          }
        } else {
          if (mouseX > rec.Active.startPositionX && mouseX < rec.Active.startPositionX + rec.Active.Width
            && mouseY > rec.Active.startPositionY && mouseY < rec.Active.startPositionY + rec.Active.Height) {
            erxpectedClickableItems = rec;
          }

        }
        return true;
      });

      if (erxpectedClickableItems != null) {
        if (mouseX > erxpectedClickableItems.Active.startPositionX && mouseX < erxpectedClickableItems.Active.startPositionX + erxpectedClickableItems.Active.Width
          && mouseY > erxpectedClickableItems.Active.startPositionY && mouseY < erxpectedClickableItems.Active.startPositionY + erxpectedClickableItems.Active.Height) {
          erxpectedClickableItems.Active.Hover = true;
          hoverElement.name = erxpectedClickableItems.name;
          hoverElement.hover = erxpectedClickableItems.Active.Hover;
          hoverElement.cursorPointer = p.cursor(p.HAND);
        }
        else {
          hoverElement.hover = false;
          erxpectedClickableItems = null;
          hoverElement.cursorPointer = p.cursor(p.ARROW);
        }
      }
    };


    // mouse Click event
    p.mouseClicked = () => {
      if (erxpectedClickableItems != null) {
        // set the Target Id in URL
        let targetID: any;
        if (erxpectedClickableItems.metElementType == "DecisionGate" || erxpectedClickableItems.metElementType == "IterativeDecisionGate") {
          targetID = erxpectedClickableItems.metElementId;
        } else {
          let targetIdArray = sortedElements.filter((item: any) => item.metSequence > erxpectedClickableItems.metSequence && (item.metElementType == "DecisionGate" || erxpectedClickableItems.metElementType == "IterativeDecisionGate")) || [];
          if (targetIdArray.length == 0) {
            targetID = erxpectedClickableItems.metElementId;
          } else {
            targetID = targetIdArray[0].ID;
          }
        }


        if (erxpectedClickableItems.link != null) {
          // redirect page decision 
          let pageName = GenericModelService.projectSiteType == "Model Site" ? erxpectedClickableItems.link.split(".").join("_desc.") : erxpectedClickableItems.link;

          let param = "FilterField1=metElementId&FilterValue1=" + erxpectedClickableItems.metElementId + "&targetId=" + targetID + "&_metElementId=" + erxpectedClickableItems.metElementId + "&modelId=" + GenericModelService.ModelId;
          let url = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + pageName + '?' + param;
          window.location.href = url;
        }
        return false;
      }
    };

    //#endregion mouse click end

    p.noStroke();
    //p.noLoop();
    p.windowResized = () => {
      p.resizeCanvas(Number(canvasWidth) / Number(((1 / modelRatio) || 1)), Number(canvasHeight) / Number((1 / modelRatio) || 1));
    };
  };

  // Function for generating Title text
  function generateText(rec: any, yAxisPosition: any, height: any, marginLeftSite: any, canvasOjb: any, ) {
    if (rec.metLevelTitleText != null && rec.metLevelTitleText != '') {
      let titleTextVerticalPosition: any = rec.metTitlePositionVerticalAlgnmt;
      let titleTextHorizontalPosition: any = rec.metTitlePositionHorizontalAlgnmt;
      let TitleTextHorizontalAlignment: any = rec.metTitleTextHorizontalAlignment;
      let TitleYaxis: any;
      let TitleXaxis: any;
      let Alignment: any;
      //  evaluate text Y position
      switch (titleTextVerticalPosition) {
        case 'top':
          TitleYaxis = yAxisPosition + 15;
          break;
        case 'bottom':
          TitleYaxis = yAxisPosition + height - 5;
          break;
        case 'middle':
          TitleYaxis = yAxisPosition + height / 2;
          break;
      }
      //  evaluate text X position
      switch (titleTextHorizontalPosition) {
        case 'left':
          //(canvasOjb.width /50)
          TitleXaxis = marginLeftSite + (canvasOjb.width / 40);
          break;
        case 'center':
          TitleXaxis = (marginLeftSite + canvasOjb.width) / 2 + 5;
          break;
        case 'right':
          TitleXaxis = (marginLeftSite + canvasOjb.width) / 2 + ((canvasOjb.width / 4) + canvasOjb.width / 6);
          break;
      }
      //  evaluate text allignment
      switch (TitleTextHorizontalAlignment) {
        case 'left':
          Alignment = p.RIGHT;
          break;
        case 'center':
          Alignment = p.CENTER;
          break;
        case 'right':
          Alignment = p.LEFT;
          break;
      }
      // Rendering Title
      p.fill(rec.metTitleFontColor);
      p.textAlign(Alignment);
      p.textSize(rec.metTitleFontSize);
      p.text(rec.metLevelTitleText, TitleXaxis, TitleYaxis);
    }
  }

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

}
