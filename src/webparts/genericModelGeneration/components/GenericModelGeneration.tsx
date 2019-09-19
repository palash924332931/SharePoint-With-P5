import * as React from 'react';
import styles from './GenericModelGeneration.module.scss';
import P5Wrapper from 'react-p5-wrapper';
import { IGenericModelGenerationProps } from './IGenericModelGenerationProps';
import GenericModelService from '../services/GenericModelService';
import sketch from './Shapes/GenerateCanvas';
import { UrlQueryParameterCollection } from '@microsoft/sp-core-library';
import ReactHtmlParser from 'react-html-parser';
import './CustomCarouselDesign.css';
import ProcessDropdown from './ProcessDropdown';
import * as strings from 'GenericModelGenerationWebPartStrings';

export default class GenericModelGeneration extends React.Component<IGenericModelGenerationProps, {}> {
  public siteRelativeUrl: any;
  public siteUrl: any;
  public host: any;
  public state: any = -{
    enabledRender: false,
    enabledProjectModelToModal: false,
    selectedElementsForNavigate: [] = [],
    projectDescripton: "",
    processItems: [] = []
  };

  public modelId: number = 0;
  public selectedElementId: number = 0;
  public isRemoveFilterForProjectRoom: boolean = false;
  public processSite: boolean;
  constructor(props) {
    super(props);
  }

  //call during init 
  public async componentDidMount() {
    this.siteRelativeUrl = this.props.context.pageContext.web.serverRelativeUrl;
    this.siteUrl = this.props.context.pageContext.web.absoluteUrl;
    this.host = this.props.context.pageContext.web.Url;
    let service = new GenericModelService(this.siteUrl, this.siteRelativeUrl);
    let queryFilter = '';
    let distanceLevelSummary: any = [];
    var queryParameters = new UrlQueryParameterCollection(window.location.href);
    this.modelId = parseInt(queryParameters.getValue("modelId")) || 0;
    this.selectedElementId = parseInt(queryParameters.getValue("_metElementId")) || 0;
    GenericModelService.seletedMetElementId = this.selectedElementId;
    GenericModelService.ModelId = this.modelId;

    let metSupportValue=queryParameters.getValue('_metSupportingProcess') || "";
    //to set the param for the process dropdown
    await this.setState({
      parameters: {
        filterField1: queryParameters.getValue('FilterField1') || "",
        metElementId: queryParameters.getValue('_metElementId') || "",
        filterField2: queryParameters.getValue('FilterField2') || "",
        metSupportingProcess:metSupportValue!=""? decodeURI(metSupportValue) : "",
      }
    });

    await service.getFilterConfigurationListData("metFilterConfiguration").then((FilterData) => {
      FilterData.length > 0 ? this.processSite = true : this.processSite = false;
    });
    //to get project model description/ default id
    await service.GetListInformation("metProjectModels", (this.modelId).toString(), this.isRemoveFilterForProjectRoom).then(
      (rec: any) => {
        rec = rec || [];
        if (rec.length > 0) {
          if (this.modelId == 0) {
            this.modelId = rec[0].Id || 0;
            GenericModelService.ModelId = this.modelId;
          }
          this.setState({ projectDescripton: rec[0].metRichProjectModelDescription });
        }
      }
    );


    if (this.props.isProjectRoom && this.modelId == 0) {
      this.isRemoveFilterForProjectRoom = true;
    } else {
      this.isRemoveFilterForProjectRoom = false;
    }

    //to get data of settings 
    await service.getModelSettings("metProjectModelSettings", this.modelId.toString(), this.isRemoveFilterForProjectRoom).then(
      (data) => {
        GenericModelService.ModelSettings = data || [];
      }
    );

    //to get data of leveles
    await service.getListRecordAsyn("metProjectModelLevels", this.modelId.toString(), this.isRemoveFilterForProjectRoom).then(
      (data) => {
        data = this.fnSorting((data || []), 'metLevelNumber', 'asc') || [];
        let customeModelId = 0;
        let canvasY = 5;
        data.forEach((rec: any) => {
          canvasY = canvasY + (rec.metLevelHeight || 0);
          customeModelId = rec.metProjectModel != null ? rec.metProjectModel.ID : 0 || 0;
          distanceLevelSummary.push({
            Level: rec.metLevelNumber,
            StartPosition: distanceLevelSummary.reduce((sum: number, val: any) => sum + val.LevelHeight, 0) || 0,
            LevelHeight: rec.metLevelHeight || 0,
            ElementTopPosition: rec.metElementTopPosition || ''
          });
        });
        GenericModelService.CanvasY = canvasY + 5;
        GenericModelService.Levels = data || [];
        if (this.modelId == 0) {
          this.modelId = customeModelId;
          GenericModelService.ModelId = customeModelId;

        }
      }
    );

    //to get data from elements
    await service.getListRecordAsyn("metProjectModelElements", (this.modelId).toString(), this.isRemoveFilterForProjectRoom).then(
      async (data: any) => {
        data = data || [];
        let canvasX = 0;
        await data.forEach(async (rec: any) => {
          let levelDistance = await distanceLevelSummary.filter(x => (x.Level) == (rec.metLevel || 0)) || [];
          rec.metSequence = rec.metSequence == null ? 0 : (rec.metSequence || 0),
            rec.StartPosition = levelDistance.length > 0 ? (levelDistance[0].StartPosition || 0) : 0,
            rec.LevelHeight = levelDistance.length > 0 ? levelDistance[0].LevelHeight : 0,
            rec.ElementTopPosition = levelDistance.length > 0 ? levelDistance[0].ElementTopPosition : "",

            //to calculate canvas X
            canvasX = canvasX + this.calculateWidth(rec);
        });
        GenericModelService.CanvasX = canvasX + 0;
        GenericModelService.Elements = this.fnSorting((data), 'metSequence', 'asc');

        this.getElementStatus();
      }
    );


    //to get data to build process dropdown
    if (+this.props.modelTypeSelection == 2 && this.processSite == true) {
      this.getDataForProcess();
     // console.log("doc :: ", document.querySelector("#processDropdownComponent"));
      let processComponentWidth = 0;

      let selectedDom: any = document.getElementById("processDropdownComponent");
      let obj: any = this.closestElement(selectedDom, ".CanvasSection") || null;
      if (obj != null) {
        processComponentWidth= obj.clientWidth || 0;
      }
      //console.log("processComponentWidth: ", processComponentWidth);
      if (processComponentWidth < 450) {
        document.getElementById("processDropdownComponent").classList.add("smallScreenOfProcess");
      } else {
        document.getElementById("processDropdownComponent").classList.remove("smallScreenOfProcess");
      }
    }


    //start to render the canvas
    this.setState({ enabledRender: true });



  }

  public async getDataForProcess() {
    //get data for process dropdown
    let service = new GenericModelService(this.siteUrl, this.siteRelativeUrl);
    service.getProcessElementsAsyn('metProjectDocuments').then((processItems: any) => {
      this.setState({
        processItems: processItems || [],
        isProcessLoaded: true
      });
    });

  }

  public getElementStatus() {
    //get data for element status
    let service = new GenericModelService(this.siteUrl, this.siteRelativeUrl);
    //if (this.selectedElementId == 0) {
    service.getStatusProperties('metProjectModelElementStatus').then((record: any) => {
      record = record || [];
      GenericModelService.ElementStatus = record || [];

      let selectedElementForNavigation = [];
      if ((record || []).length == 0) {
        selectedElementForNavigation.push(GenericModelService.Elements[0]);

      }
      else {
        //code to test the title of Carousel
        let dgApprovedSequenceNo: number = 0;
        // if there are no approved Decisiongate or any item in lists
        if (record.filter((r: any) => r.metStatus == 'Approved').length == 0) {
          selectedElementForNavigation.push(GenericModelService.Elements.filter((row: any) => row.metElementType == 'Phase')[0]);
        }
        // if there are approved decision gate
        let sortedApprovedInfo = this.fnSorting(record, 'metSequence', 'desc') || [];
        let lastApprovedDG = sortedApprovedInfo.length > 0 ? sortedApprovedInfo.filter((info: any) => info.metStatus == "Approved") : [];
        if (lastApprovedDG.length > 0) {
          lastApprovedDG.forEach((approvedDG: any) => {
            GenericModelService.Elements.forEach((ele: any) => {
              if (ele.Id == approvedDG.metTargetElement.ID && ele.metElementType == 'DecisionGate' && ele.metSequence > dgApprovedSequenceNo) {
                dgApprovedSequenceNo = +ele.metSequence;
                let calculatedItem = GenericModelService.Elements.filter((rec: any) => {
                  if (rec.metElementType == 'Phase' && rec.metSequence > ele.metSequence) {
                    return true;
                  } else {
                    return false;
                  }
                })[0] || GenericModelService.Elements.filter((row: any) => {
                  if (row.metElementType == 'Phase') {
                    return true;
                  } else {
                    return false;
                  }
                })[0];

                selectedElementForNavigation = [];
                selectedElementForNavigation.push(calculatedItem);
              }
            });
          });
        }
      }

      // to set the navigatin title
      if (this.selectedElementId > 0) {
         selectedElementForNavigation = [];
        GenericModelService.Elements.forEach((ele: any) => {
          if (ele.Id == this.selectedElementId) {
            selectedElementForNavigation.push(ele);
          }
        });

        this.setState({ selectedElementsForNavigate: selectedElementForNavigation });
        this.selectedElementId = selectedElementForNavigation[0].Id || 0;
      } else {
        this.setState({ selectedElementsForNavigate: selectedElementForNavigation });
        this.selectedElementId = selectedElementForNavigation[0].Id;
      }


    });


  }

  public calculateWidth(rec: any): number {
    let xValue = Number(rec.metWidth || 0);
    let ovarlapDistance: number = Number(rec.metOverlap) || 0;

    switch (rec.metElementType) {
      case 'Phase':
        xValue = xValue == 0 ? (GenericModelService.ModelSettings[0].metPhaseWidth || 0) + ovarlapDistance : xValue + ovarlapDistance;
        break;
      case 'IterativePhase':
        xValue = xValue == 0 ? (GenericModelService.ModelSettings[0].metPhaseWidth || 0) + ovarlapDistance : xValue + ovarlapDistance;
        break;
      case 'DecisionGate':
        xValue = xValue == 0 ? (GenericModelService.ModelSettings[0].metDecisionGateWidth || 0) + ovarlapDistance : xValue + ovarlapDistance;
        break;
      case 'IterativeDecisionGate':
        xValue = xValue == 0 ? (GenericModelService.ModelSettings[0].metDecisionGateWidth || 0) + ovarlapDistance : xValue + ovarlapDistance;
        break;
      case 'Milestone':
        xValue = xValue == 0 ? (GenericModelService.ModelSettings[0].metMilestoneWidth || 0) + ovarlapDistance : xValue + ovarlapDistance;
        break;
    }

    return xValue;

  }

  //go to next or previous button
  public redirec(ButtonClickedCheck) {
    let selectedEleemntAfterClick = [];
    GenericModelService.Elements.map((item, key) => {
      if (item.Id == this.selectedElementId) {
        if (ButtonClickedCheck == "prev") {
          if ((key - 1) == -1) {
            selectedEleemntAfterClick.push(GenericModelService.Elements[GenericModelService.Elements.length - 1]);
          }
          else {
            selectedEleemntAfterClick.push(GenericModelService.Elements[key - 1]);
          }
        }
        else {
          if ((GenericModelService.Elements.length - 1) == key) {
            selectedEleemntAfterClick.push(GenericModelService.Elements[0]);
          }
          else {
            selectedEleemntAfterClick.push(GenericModelService.Elements[key + 1]);
          }

        }
      }
    });

    this.setState({ selectedElementsForNavigate: selectedEleemntAfterClick });
    this.selectedElementId = selectedEleemntAfterClick[0].Id;
    let param = "FilterField1=metElementId&FilterValue1=" + selectedEleemntAfterClick[0].Id + "&targetId=" + selectedEleemntAfterClick[0].Id + "&_metElementId=" + selectedEleemntAfterClick[0].Id + "&modelId=" + selectedEleemntAfterClick[0].metProjectModel.ID;
    let url = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + selectedEleemntAfterClick[0].metUrl + '?' + param;
    window.location.href = url;
  }

  //redirect to url  
  public redirectToUrl(phaseDGProperty: any) {
    if (phaseDGProperty.metUrl != null) {
      this.selectedElementId = phaseDGProperty.Id;
      let param = "FilterField1=metElementId&FilterValue1=" + phaseDGProperty.Id + "&targetId=" + phaseDGProperty.Id + "&_metElementId=" + phaseDGProperty.Id + "&modelId=" + phaseDGProperty.metProjectModel.ID;
      let url = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + phaseDGProperty.metUrl + '?' + param;
      window.location.href = url;
    }
  }


  public fnShowProjectModel() {

    let selectedDom: any = document.getElementById("modelCavansRender");
    let obj: any = this.closestElement(selectedDom, ".CanvasSection") || null;

    if (obj != null) {
      obj.style.zIndex = "1000";
    }

    let projectModalStatus: boolean = false;
    if (this.state.enabledProjectModelToModal) {
      projectModalStatus = false;
    } else {
      projectModalStatus = true;
    }

    this.setState({ enabledProjectModelToModal: projectModalStatus });
  }


  public closestElement(el, selector) {
    var matchesFn;
    // find vendor prefix
    ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some((fn) => {
      if (typeof document.body[fn] == 'function') {
        matchesFn = fn;
        return true;
      }
      return false;
    });

    var parent;

    // traverse parents
    while (el) {
      parent = el.parentElement;
      if (parent && parent[matchesFn](selector)) {
        return parent;
      }
      el = parent;
    }

    return null;
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
    GenericModelService.modelSize = this.props.modelSize || 100;

    //to set the project site type in service
    if (this.props.isProjectRoom) {
      GenericModelService.projectSiteType = "Project Room";
    } else {
      GenericModelService.projectSiteType = "Model Site";
    }


    let mobileDeviceHiddenClass = this.props.navigationHiddenInMobileWindow == "Yes" ? 'hideOnMobileDevice' : "";

    //console.log("mobileDeviceHiddenClass",mobileDeviceHiddenClass);
    //******************* Section for Carousel  ***************** **********************/
    let itemTitle = (this.state.selectedElementsForNavigate || []).length > 0 ? <div className="carousel-item active">
      <button className="btn btn-primary btn-large w-100 text-white" onClick={this.redirectToUrl.bind(this, this.state.selectedElementsForNavigate[0])} ><strong>{this.state.selectedElementsForNavigate[0].Title}</strong></button>
    </div>
      :
      <div className="carousel-item active">
        <button className="btn btn-primary btn-large w-100 text-white" ><strong></strong></button>
      </div>
      ;
    //************************************************************ */


    let drawingContent: any;
    if (this.state.enabledRender) {
      drawingContent = <div className={styles.modelDesignContainer}><P5Wrapper sketch={sketch} /></div>;
    }


    let activeModalClass = this.state.enabledProjectModelToModal == true ? "activeModal" : "";

    let projectNavigationContent = +this.props.modelTypeSelection == 2 && this.processSite == false ?
      <div className={"container-fluid overflow-hide " + mobileDeviceHiddenClass}>
        <div className="row d-block" id="modelCavansRender">
          <div className="col-12 d-flex flex-wrap align-items-center justify-content-between ide-wrap">
            <div className="w-100">
              <div className="d-flex ide-item-wrap">
                <div className="button-wrap"  >
                  <a href="#" className="btn rounded-circle lg-circle" role="button" onClick={this.redirec.bind(this, "prev")} ><i className="fa fa-angle-left"></i></a>
                </div>
                <div className="ide-content text-center ide-item-wrap">
                  <div className="clearfix">{itemTitle}</div>
                  <div className="d-flex justify-content-center btn-show-model"><a href="#" onClick={this.fnShowProjectModel.bind(this)} ><p>{strings.ShowProjectModelTitle}</p></a></div>
                </div>
                <div className="button-wrap">
                  <a href="#" className="btn rounded-circle lg-circle" role="button" onClick={this.redirec.bind(this, "next")}><i className="fa fa-angle-right"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className={"pop-up-container show-" + this.props.navigationModelPosition + " " + activeModalClass} >
            <div className="pop-content">
              {drawingContent}
            </div>
          </div>
        </div>
      </div>

      : +this.props.modelTypeSelection == 2 && this.processSite == true ?

        <ProcessDropdown
          elements={GenericModelService.Elements || []}
          processItems={this.state.processItems || []}
          parameters={this.state.parameters}
          defaultSelectedElementId={this.selectedElementId}
          paneProperties={this.props}
          stateProperties={this.state}
          drawingContent={drawingContent}
        />
        : "";

    //************** End of Modal Content******************* */

    let projectModelContent = +(this.props.modelTypeSelection || 1) == 1 ?
      <div>
        <h2 className="model-heading"> {this.props.wpTitle}</h2>
        {drawingContent}
        <div>
          <br />
          {(this.props.isShowDescription || "1") == "1" ? ReactHtmlParser(this.state.projectDescripton) : ""}
        </div>
      </div>
      :
      "";
    //************** Start  of Process Dropdown Content******************* */

    // let generateProcessDropdown: any;
    // if (this.props.modelTypeSelection == "3") {// generate dropdown
    //   generateProcessDropdown =
    //     <ProcessDropdown
    //       elements={GenericModelService.Elements || []}
    //       processItems={this.state.processItems || []}
    //       parameters={this.state.parameters}
    //       defaultSelectedElementId={this.selectedElementId}
    //       paneProperties={this.props}
    //       stateProperties={this.state}
    //       drawingContent={drawingContent}
    //     />;
    // } else {
    //   generateProcessDropdown = "";
    // }

    return (
      <div className={styles.genericModelGeneration}>
      <div className={styles.container}>
        <div>
          {projectNavigationContent}
        </div>

        <div className={this.props.modelTypeSelection == "1" ? styles.setDefaultBackground : ""}>
          {projectModelContent}
        </div>

        {/* <div>
          {generateProcessDropdown}
        </div> */}



      </div>
      </div>

    );
  }
}
