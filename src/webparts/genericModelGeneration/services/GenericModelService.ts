import { Web } from '@pnp/sp';
import { Session, taxonomy } from "@pnp/sp-taxonomy";
import "@pnp/polyfill-ie11";
import { MockData } from './MockData';

class GenericModelService {
    public siteUrl: string;
    public web: Web;
    public siteRelativeUrl: string;
    public static Levels: any[] = [];
    public static Elements: any[] = [];
    public static ModelSettings: any[] = [];
    public static ElementStatus: any[] = [];
    public static ModelId: number = 0;
    public static CanvasX: number = 1000;
    public static CanvasY: number = 100;
    public static isResizeCanvas: boolean = false;
    public static resizeRatio: number = 0.5;
    public static modelSize: number = 100;
    public static seletedMetElementId: number = 0;
    public static projectSiteType: string = "";

    public constructor(siteUrl: string, siteRelativeUrl: string) {
        this.siteUrl = siteUrl;
        this.web = new Web(this.siteUrl);
        this.siteRelativeUrl = siteRelativeUrl;
    }
    public async getFilterConfigurationListData(listName): Promise<any> {
        if(DEBUG){
            await new Promise(resolve => setTimeout(resolve, 1000));
            return MockData.filterData || [];
        }
        return this.web.getList(this.siteRelativeUrl + '/lists/' + listName)
        .items
        .get();
    }
    public async getListRecordAsyn(listName: string, modelId: string, flagToRemovelFilter: boolean = false): Promise<any> {
        let selectedColumns: any = [];
        if (DEBUG) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (listName == "metProjectModelLevels") {
                return MockData.levels || [];
            } else {
                return MockData.elements || [];
            }
        }


        if (listName == "metProjectModelLevels") {
            selectedColumns = ["Id", "ServerRedirectedEmbedUri", "ServerRedirectedEmbedUrl", "ContentTypeId", "metDivisoryLineColor", "Title", "ComplianceAssetId", "metUrl", "metProjectModel/ID", "metLevelNumber", "metLevelHeight", "metBackgroundColor", "metLevelTitleText", "metTitlePositionVerticalAlgnmt", "metTitlePositionHorizontalAlgnmt", "metTitleTextHorizontalAlignment", "metTitleOrientation", "metTitleFontColor", "metTitleFontSize", "metHasBackgroundShape", "metBackgroundShape", "metBackgroundShapeColor", "metHasDivisoryLine", "metDivisoryLineColor", "metElementTopPosition", "ID", "Modified", "Created", "AuthorId", "EditorId", "Attachments", "GUID"];
        }
        else if (listName == "metProjectModelElements") {
            selectedColumns = ["FileSystemObjectType", "Id", "ServerRedirectedEmbedUri", "ServerRedirectedEmbedUrl", "ContentTypeId", "Title", "ComplianceAssetId", "metSequence", "metElementType", "metWidth", "metOverlap", "metLevel", "metColor", "metShape", "metUrl", "metProjectModel/ID", "metProjectModelElementFullName", "metDescription", "ID", "Modified", "Created", "AuthorId", "EditorId", "Attachments", "GUID"];

        }


        if (flagToRemovelFilter) {
            return this.web.getList(this.siteRelativeUrl + '/lists/' + listName)
                .items
                .select(selectedColumns.join())
                .expand('metProjectModel')
                //.filter("metProjectModel/ID eq " + modelId)
                .get();
        }

        return this.web.getList(this.siteRelativeUrl + '/lists/' + listName)
            .items
            .select(selectedColumns.join())
            .expand('metProjectModel')
            .filter("metProjectModel/ID eq " + modelId)
            .get();
    }

    public async getModelSettings(listName: string, modelId: string, flagToRemovelFilter: boolean = false): Promise<any> {
        if (DEBUG) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return MockData.modelSettings || [];
        }

        if (flagToRemovelFilter) {
            return this.web.getList(this.siteRelativeUrl + '/lists/' + listName)
                .items
                .select("FileSystemObjectType", "Id", "ServerRedirectedEmbedUri", "ServerRedirectedEmbedUrl", "ContentTypeId", "Title", "ComplianceAssetId", "metProjectModel/ID", "metChevronFarEastPoint", "metRenderStartingPosition", "metDecisionGateWidth", "metDecisionGateHeight", "metMilestoneWidth", "metMilestoneHeight", "metPhaseWidth", "metPhaseHeight", "metDecisionGateFontSize", "metPhaseFontSize", "metMilestoneFontSize", "metDecisionGateTopPosition", "metPolygonBorderColor", "metDecisionGateFontColor", "metPhaseFontColor", "metMilestoneFontColor", "metDGColorApproved", "metDGColorRequested", "metDGColorRejected", "metElementColorSelected", "metFontFamily", "ID", "Modified", "Created", "AuthorId", "EditorId", "Attachments", "GUID")
                .expand('metProjectModel')
                //.filter("metProjectModel/ID eq " + modelId)
                .get();
        }
        return this.web.getList(this.siteRelativeUrl + '/lists/' + listName)
            .items
            .select("FileSystemObjectType", "Id", "ServerRedirectedEmbedUri", "ServerRedirectedEmbedUrl", "ContentTypeId", "Title", "ComplianceAssetId", "metProjectModel/ID", "metChevronFarEastPoint", "metRenderStartingPosition", "metDecisionGateWidth", "metDecisionGateHeight", "metMilestoneWidth", "metMilestoneHeight", "metPhaseWidth", "metPhaseHeight", "metDecisionGateFontSize", "metPhaseFontSize", "metMilestoneFontSize", "metDecisionGateTopPosition", "metPolygonBorderColor", "metDecisionGateFontColor", "metPhaseFontColor", "metMilestoneFontColor", "metDGColorApproved", "metDGColorRequested", "metDGColorRejected", "metElementColorSelected", "metFontFamily", "ID", "Modified", "Created", "AuthorId", "EditorId", "Attachments", "GUID")
            .expand('metProjectModel')
            .filter("metProjectModel/ID eq " + modelId)
            .get();
    }

    public async GetDetailsItemsFromList(listName, selectItems, expandItems, filterParams): Promise<any> {
        if (DEBUG) {
            await new Promise(resolve => setTimeout(resolve, 100));
            return MockData.levels || [];
        }

        if (filterParams == '' && expandItems.length == 0) {
            return this.web.getList(this.siteRelativeUrl + '/lists/' + listName).items
                .get();
        }
        if (expandItems.length > 0 && filterParams == '') {
            return this.web.getList(this.siteRelativeUrl + '/lists/' + listName).items
                .select(selectItems.join())
                //.select('ID','Title','Created','Author/Title')
                .expand(expandItems.join())
                //.filter(filterParams)
                .get();
        }
        return this.web.getList(this.siteRelativeUrl + '/lists/' + listName).items
            .select(selectItems.join())
            .expand(expandItems.join())
            .filter(filterParams)
            .get();

        // return this.web.getList(this.siteRelativeUrl + '/lists/' + listName).items
        //     .filter(filterParams)
        //     .get();
    }


    public async GetListInformation(listName: string, modelId: string, flagToRemovelFilter: boolean = false): Promise<any> {
        let selectedColumns: any = [];
        if (DEBUG) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return MockData.projectDescription || [];
        }

        if (flagToRemovelFilter || +modelId == 0) {
            return this.web.getList(this.siteRelativeUrl + '/lists/' + listName)
                .items
                .select(selectedColumns.join())
                //.filter("ID eq " + modelId)
                .orderBy('ID', true)
                .get();
        }
        return this.web.getList(this.siteRelativeUrl + '/lists/' + listName)
            .items
            .select(selectedColumns.join())
            .filter("ID eq " + modelId)
            .orderBy('ID', true)
            .get();
    }

    public async getStatusProperties(listName, filterCondition = ''): Promise<any> {
        if (DEBUG) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return MockData.elementStatus || [];
        }


        if (filterCondition == '') {
            return this.web.getList(this.siteRelativeUrl + '/lists/' + listName)
                .items
                .select('ID', 'metTargetElement/ID', 'metTargetElement/Title', 'metStatus')
                .expand('metTargetElement')
                .orderBy('ID', false)
                .get();
        }
        else {
            return this.web.getList(this.siteRelativeUrl + '/lists/' + listName)
                .items
                .filter(filterCondition)
                .select('ID', 'metTargetElement/ID', 'metTargetElement/Title', 'metStatus')
                .expand('metTargetElement')
                .orderBy('ID', false)
                .get();
        }
    }

   

    //to get data from taxonomy field
    public async getProcessElementsAsyn(listName): Promise<any> {

        if (DEBUG) {// to run in local section 
            await new Promise(resolve => setTimeout(resolve, 1000));
            return MockData.processInfo || [];
        }

        var processItems = new Array();
        await this.web.getList(this.siteRelativeUrl + '/lists/' + listName) //get the taxonomy field information
            .fields
            .getByInternalNameOrTitle('metSupportingProcess')
            .get()
            .then(async (supportingProcessItem) => {
                if (supportingProcessItem['AnchorId'] == "00000000-0000-0000-0000-000000000000") {
                    await new Session(this.siteUrl)
                        .termStores
                        .getById(supportingProcessItem['SspId'])
                        .getTermSetById(supportingProcessItem['TermSetId'])
                        .terms
                        .get()
                        .then(async (item) => {
                            await item.forEach(element => {
                                var regExp = /\(([^)]+)\)/;
                                var guidID = regExp.exec(element['Id']);
                                processItems.push({ Id: guidID[1], Title: element['PathOfTerm'], Url: ['LocalCustomProperties']['MetierPageUrl'] });
                            });
                        });
                }
                else {
                    await new Session(this.siteUrl)
                        .termStores
                        .getById(supportingProcessItem['SspId'])
                        .getTermSetById(supportingProcessItem['TermSetId'])
                        .getTermById(supportingProcessItem['AnchorId'])
                        .terms
                        .get()
                        .then(async (item) => {
                            await item.forEach(element => {
                                var regExp = /\(([^)]+)\)/;
                                var guidID = regExp.exec(element['Id']);
                                processItems.push({ Id: guidID[1], Title: element['PathOfTerm'], Url: ['LocalCustomProperties']['MetierPageUrl'] });
                            });
                        });
                }
            });
        return processItems;
    }

}
export default GenericModelService;