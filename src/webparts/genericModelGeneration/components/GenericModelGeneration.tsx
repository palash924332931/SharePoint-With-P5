import * as React from 'react';
import styles from './GenericModelGeneration.module.scss';
import P5Wrapper from 'react-p5-wrapper';
import { IGenericModelGenerationProps } from './IGenericModelGenerationProps';
import GenericModelService from '../services/GenericModelService'
import sketch from './Shapes/Level';
import { UrlQueryParameterCollection } from '@microsoft/sp-core-library';
import ReactHtmlParser from 'react-html-parser';

export default class GenericModelGeneration extends React.Component<IGenericModelGenerationProps, {}> {
  public state: any = -{
    enabledRender: false
  };
  public modelId: number = 2;
  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: 0,
      projectDescripton: ''
    }
  }

  public async componentDidMount() {
    let siteRelativeUrl = this.props.context.pageContext.web.serverRelativeUrl;
    let siteUrl = this.props.context.pageContext.web.absoluteUrl;
    let host = this.props.context.pageContext.web.Url;
    let service = new GenericModelService(siteUrl, siteRelativeUrl);
    let queryFilter = '';
    let distanceLevelSummary: any = [];
    var queryParameters = new UrlQueryParameterCollection(window.location.href);
    this.modelId = parseInt(queryParameters.getValue("modelId")) || 0;
    GenericModelService.ModelId = this.modelId;


    await service.getModelSettings("metProjectModelSettings", this.modelId.toString()).then(
      (data) => {
        //console.log("settings data: ", JSON.stringify(data));
        GenericModelService.ModelSettings = data || [];
      }
    );

    await service.GetListRecord("metProjectModelLevels", this.modelId.toString()).then(
      (data) => {

        data = this.fnSorting((data || []), 'metLevelNumber', 'asc') || [];
        let canvasY = 5;
        data.forEach((rec: any) => {
          canvasY = canvasY + (rec.metLevelHeight || 0);
          distanceLevelSummary.push({
            Level: rec.metLevelNumber,
            StartPosition: distanceLevelSummary.reduce((sum: number, val: any) => sum + val.LevelHeight, 0) || 0,
            LevelHeight: rec.metLevelHeight || 0,
            ElementTopPosition: rec.metElementTopPosition || ''
          });
        });
        GenericModelService.CanvasY = canvasY + 5;
        GenericModelService.Levels = data || [];
        //console.log("data: levels:  ", JSON.stringify(data));
      }
    );

    await service.GetListRecord("metProjectModelElements", (this.modelId).toString()).then(
      async (data: any) => {

        data = data || [];
        let canvasX = 0;
        await data.forEach(async (rec: any) => {
          console.log("Level: ", rec.metLevel, ' element name: ', rec.Title, " distance::: ", distanceLevelSummary.filter(x => x.Level == rec.metLevel));
          let levelDistance = await distanceLevelSummary.filter(x => (x.Level) == (rec.metLevel || 0)) || [];
          rec.metSequence = rec.metSequence == null ? 0 : (rec.metSequence || 0),
            rec.StartPosition = levelDistance.length > 0 ? (levelDistance[0].StartPosition || 0) : 0,
            rec.LevelHeight = levelDistance.length > 0 ? levelDistance[0].LevelHeight : 0,
            rec.ElementTopPosition = levelDistance.length > 0 ? levelDistance[0].ElementTopPosition : "",

            //to calculate canvas X
            canvasX = canvasX + this.calculateWidth(rec);
            console.log("Name: ",rec.Title,"canvas X: ",canvasX,' Calculate Size :',this.calculateWidth(rec));
        });
        GenericModelService.CanvasX = canvasX + 0;
        GenericModelService.Elements = data || [];
        console.log("GenericModelService.CanvasX : ",GenericModelService.CanvasX );
      }
    );

    service.GetListInformation("metProjectModels", (this.modelId).toString()).then(
      (rec: any) => {
        console.log("Project Description:  ", rec);
        rec=rec||[];
        if(rec.length>0){
          this.setState({projectDescripton:rec[0].metRichProjectModelDescription});
        }
      }
    );


    this.setState({ enabledRender: true });


  }

  public calculateWidth(rec: any): number {
    let xValue = Number(rec.metWidth || 0);
    let ovarlapDistance: number = Number(rec.metOverlap) || 0;

    switch (rec.metElementType) {
      case 'Phase':
        xValue = xValue == 0 ? (GenericModelService.ModelSettings[0].metPhaseWidth || 0) + ovarlapDistance : xValue + ovarlapDistance;
        //console.log("Phase xVal: ", xValue, " ovarlapDistance : ", ovarlapDistance, " name: ", rec.Title);
        break;
      case 'IterativePhase':
        xValue = xValue == 0 ? (GenericModelService.ModelSettings[0].metPhaseWidth || 0) + ovarlapDistance : xValue + ovarlapDistance;
        //console.log("IterativePhase xVal: ", xValue, " ovarlapDistance : ", ovarlapDistance, " name: ", rec.Title);
        break;
      case 'DecisionGate':
        xValue = xValue == 0 ? (GenericModelService.ModelSettings[0].metDecisionGateWidth || 0) + ovarlapDistance : xValue + ovarlapDistance;
        //console.log("DecisionGate xVal: ", xValue, " ovarlapDistance : ", ovarlapDistance, " name: ", rec.Title);
        break;
      case 'IterativeDecisionGate':
        xValue = xValue == 0 ? (GenericModelService.ModelSettings[0].metDecisionGateWidth || 0) + ovarlapDistance : xValue + ovarlapDistance;
        //console.log("IterativeDecisionGate xVal: ", xValue, " ovarlapDistance : ", ovarlapDistance, " name: ", rec.Title);
        break;
      case 'Milestone':
        xValue = xValue == 0 ? (GenericModelService.ModelSettings[0].metMilestoneWidth || 0) + ovarlapDistance : xValue + ovarlapDistance;
        //console.log("Milestone xVal: ", xValue, " ovarlapDistance : ", ovarlapDistance, " name: ", rec.Title);
        break;
    }

    //console.log(xValue);
    return xValue;

  }

  public fnSorting(dataSet: any[], columns: any, orderType: string) {
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

  public render(): React.ReactElement<IGenericModelGenerationProps> {
    let drawingContent: any;
    if (this.state.enabledRender) {
      drawingContent = <div className={styles.modelDesignContainer}><P5Wrapper sketch={sketch} /></div>
    } else {
      //no render....
    }
    return (
      <div>
        <div><h2> {this.props.description}</h2></div>
        {drawingContent}
        <div>
          <br/>
          {ReactHtmlParser(this.state.projectDescripton)}
        </div>
      </div>

    );
  }
}
