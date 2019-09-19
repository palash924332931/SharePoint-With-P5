import * as React from 'react';
import styles from './GenericModelGeneration.module.scss';
import DropDown from './DropDown';
import GenericModelService from '../services/GenericModelService';
import { UrlQueryParameterCollection } from '@microsoft/sp-core-library';
import * as strings from 'GenericModelGenerationWebPartStrings';
export default class ProcessDropdown extends React.Component<{
    elements: any[]
    processItems: any[],
    parameters: any,
    defaultSelectedElementId: number,
    paneProperties: any,
    stateProperties: any,
    drawingContent: any,
}>
{
    public state: any;

    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
        };
    }


    public redirectParentForProcessDropdownAfterChangeDD = (itemType, Id, text) => { // initialize what should be the parameters
        var pageName = "";
        var param = '';
        var currentPageName = "";
        if (this.props.parameters == null || this.props.parameters == undefined) {
            return;
        }


        // current page name
        var url = window.location.href.split('?')[0];
        if (url.indexOf("decisionGate") > -1) {
            currentPageName = "decisionGate";
        } else if (url.indexOf("phase") > -1) {
            currentPageName = "phase";
        } else if (url.indexOf("process") > -1) {
            currentPageName = "process";
        }

      
        if (itemType == 'elementItems' && +Id == 0) {// you have clicked, null select menu of elements (no item selected)
            if (this.props.parameters.metSupportingProcess != "") {
                pageName = "process.aspx";
                param = "FilterField1=metElementId&FilterValue1=" + Id + "&targetId=" + Id + "&_metElementId=" + Id + "&FilterField2=metSupportingProcess&FilterValue2=" + this.props.parameters.metSupportingProcess + "&_metSupportingProcess=" + this.props.parameters.metSupportingProcess + "";
            } else {
                pageName = "projectStatus.aspx";
                param = "";
            }
        } else if (itemType == 'processItems' && +Id == 0) {// you have clicked select menu of process
            if (this.props.parameters.metElementId != "" && this.props.parameters.metElementId != 0) {
                GenericModelService.Elements.forEach((rec: any) => {
                    if (this.props.parameters.metElementId == rec.Id) {
                        pageName = rec.metUrl;
                    }
                });
                param = "FilterField1=metElementId&FilterValue1=" + this.props.parameters.metElementId + "&targetId=" + this.props.parameters.metElementId + "&_metElementId=" + this.props.parameters.metElementId + "";
                //param = "FilterField1=metElementId&FilterValue1=" + this.props.parameters.metElementId + "&targetId=" + this.props.parameters.metElementId + "&_metElementId=" + this.props.parameters.metElementId + "&FilterField2=metSupportingProcess&FilterValue2=" + this.props.parameters.metSupportingProcess + "&_metSupportingProcess=''";
            } else {
                pageName = "projectStatus.aspx";
                param = "";
            }
        }
        else if (itemType == 'elementItems') {
            if (currentPageName == "phase" || currentPageName == "decisionGate") {
                GenericModelService.Elements.forEach((rec: any) => {
                    if (Id == rec.Id) {
                        pageName = rec.metUrl;
                    }
                });

                if (this.props.parameters.metSupportingProcess!="") {
                    param = "FilterField1=metElementId&FilterValue1=" +Id + "&targetId=" + Id + "&_metElementId=" + Id + "&FilterField2=metSupportingProcess&FilterValue2=" + this.props.parameters.metSupportingProcess + "&_metSupportingProcess=" + this.props.parameters.metSupportingProcess + "";

                } else {
                    param = "FilterField1=metElementId&FilterValue1=" + Id + "&targetId=" + Id + "&_metElementId=" + Id + "";
                }
                
            } else if (currentPageName == "process") {
                pageName = "process.aspx";
                param = "FilterField1=metElementId&FilterValue1=" + Id + "&targetId=" + Id + "&_metElementId=" + Id + "&FilterField2=metSupportingProcess&FilterValue2=" + this.props.parameters.metSupportingProcess + "&_metSupportingProcess=" + this.props.parameters.metSupportingProcess + "";
            } else {
                GenericModelService.Elements.forEach((rec: any) => {
                    if (Id == rec.Id) {
                        pageName = rec.metUrl;
                    }
                });
                param = "FilterField1=metElementId&FilterValue1=" + Id + "&targetId=" + Id + "&_metElementId=" + Id + "";
            }



        }
        else if (itemType == 'processItems') {
            if (currentPageName == "phase") {
                pageName = "phase.aspx";
                param = "FilterField1=metElementId&FilterValue1=" + this.props.parameters.metElementId + "&targetId=" + this.props.parameters.metElementId + "&_metElementId=" + this.props.parameters.metElementId + "&FilterField2=metSupportingProcess&FilterValue2=" + text + "&_metSupportingProcess=" + text + "";
            } else if (currentPageName == "decisionGate") {
                pageName = "decisionGate.aspx";
                param = "FilterField1=metElementId&FilterValue1=" + this.props.parameters.metElementId + "&targetId=" + this.props.parameters.metElementId + "&_metElementId=" + this.props.parameters.metElementId + "&FilterField2=metSupportingProcess&FilterValue2=" + text + "&_metSupportingProcess=" + text + "";

            } else if (currentPageName == "process") {
                pageName = "process.aspx";
                param = "FilterField1=metElementId&FilterValue1=" + this.props.parameters.metElementId + "&targetId=" + this.props.parameters.metElementId + "&_metElementId=" + this.props.parameters.metElementId + "& FilterField2=metSupportingProcess&FilterValue2=" + text + "&_metSupportingProcess=" + text + "";

            } else {
                pageName = "process.aspx";
                param = "FilterField2=metSupportingProcess&FilterValue2=" + text + "&_metSupportingProcess=" + text + "";

            }
        }

        
        let href = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1) + pageName + '?' + param;
        window.location.href = href;


    }

    public fnShowProjectModel() {
        //let obj: any = document.querySelector("#modelCavansRender").closest(".CanvasSection") || null;
        let selectedDom: any = document.getElementById("modelCavansRender");
        let obj: any = this.closestElement(selectedDom, ".CanvasSection") || null;
        if (obj != null) {
            obj.style.zIndex = "1000";
        }

        let projectModalStatus: boolean = false;
        if (this.state.isShow) {
            projectModalStatus = false;
        } else {
            projectModalStatus = true;
        }


        this.setState({ isShow: projectModalStatus });
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

    public render(): React.ReactElement<{}> {
        let activeModalClass = this.state.isShow == true ? "activeModal" : "";
        let mobileDeviceHiddenClass = this.props.paneProperties.navigationHiddenInMobileWindow == "Yes" ? 'hideOnMobileDevice' : "";
        let elementItems: any;
        let processItems: any;

        if (this.props.parameters != undefined && this.props.parameters != null) {
            elementItems = <DropDown dropDownItems={this.props.elements} parameters={this.props.parameters} itemType='elementItems' fnRedirectParent={this.redirectParentForProcessDropdownAfterChangeDD} defaultSelectedElementId={this.props.defaultSelectedElementId} />;

            processItems = <DropDown dropDownItems={this.props.processItems} parameters={this.props.parameters} itemType='processItems' fnRedirectParent={this.redirectParentForProcessDropdownAfterChangeDD} defaultSelectedElementId={this.props.defaultSelectedElementId} />;

        }


        let processDropdown =
            <div id="processDropdownComponent">
                <div className={styles.processContant + " d-flex flex-wrap"}>

                    <div className={styles.modelItem + " d-inline-flex align-items-center"}>
                        <div className={styles.mwSimple + " d-table-cell pr-2"}>
                            <strong className={styles.secondaryLabel}>{this.props.paneProperties.titleOfModel}:</strong>
                        </div>
                        <div className=" d-table-cell">
                            {elementItems}
                        </div>
                    </div>
                    <div className={styles.modelItem + " d-inline-flex align-items-center order-3"}>
                        <div className={styles.mwSimple + " d-table-cell pr-2"}>
                            <strong className={styles.secondaryLabel}>{this.props.paneProperties.titleOfProcess}:</strong>
                        </div>
                        <div className="d-table-cell">
                            {processItems}
                        </div>
                    </div>

                    <div className={styles.projectModelarea + " d-inline-flex projectModelarea"}>
                        <div className={"container-fluid overflow-hide " + mobileDeviceHiddenClass}>
                            <div className="row d-block " id="modelCavansRender">
                                <div className="col-12 d-flex flex-wrap align-items-center justify-content-between ide-wrap">
                                    <div className="w-100">
                                        <div className="d-flex w-100">
                                            <div className="ide-content text-center">
                                                <div className={styles.btnShowModel + " d-flex justify-content-center"}>
                                                    <a href="#" onClick={this.fnShowProjectModel.bind(this)} >
                                                        <p className="m-0"><i className="fas fa-eye"></i> {strings.ShowProjectModelTitleInProcess}</p>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className={"pop-up-container show-" + this.props.paneProperties.navigationModelPosition + " " + activeModalClass} >
                                <div className="pop-content">
                                    {this.props.drawingContent}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>;

        return (
            <div>
                {processDropdown}
            </div>
        );
    }
}