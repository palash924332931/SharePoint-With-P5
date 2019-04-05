import { Web } from 'sp-pnp-js';
import { MockData } from './mock-data'

class GenericModelService {
    public siteUrl: string;
    public web: Web;
    public siteRelativeUrl: string;
    public static Levels: any[] = [];
    public static Elements: any[] = [];
    public static ModelSettings: any[] = [];
    public static ModelId: number = 0;
    public static CanvasX: number = 1000;
    public static CanvasY: number = 100;

    public constructor(siteUrl: string, siteRelativeUrl: string) {
        this.siteUrl = siteUrl;
        this.web = new Web(this.siteUrl);
        this.siteRelativeUrl = siteRelativeUrl;
    }

    async GetListRecord(listName: string, modelId: string): Promise<any> {
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

        return this.web.getList(this.siteRelativeUrl + '/lists/' + listName)
            .items
            .select(selectedColumns.join())
            .expand('metProjectModel')
            .filter("metProjectModel/ID eq " + modelId)
            .get();
    }

    async getModelSettings(listName: string, modelId: string): Promise<any> {
        if (DEBUG) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return MockData.modelSettings || [];
        }
        return this.web.getList(this.siteRelativeUrl + '/lists/' + listName)
            .items
            .select("FileSystemObjectType", "Id", "ServerRedirectedEmbedUri", "ServerRedirectedEmbedUrl", "ContentTypeId", "Title", "ComplianceAssetId", "metProjectModel/ID", "metChevronFarEastPoint", "metRenderStartingPosition", "metDecisionGateWidth", "metDecisionGateHeight", "metMilestoneWidth", "metMilestoneHeight", "metPhaseWidth", "metPhaseHeight", "metDecisionGateFontSize", "metPhaseFontSize", "metMilestoneFontSize", "metDecisionGateTopPosition", "metPolygonBorderColor", "metDecisionGateFontColor", "metPhaseFontColor", "metMilestoneFontColor", "metDGColorApproved", "metDGColorRequested", "metDGColorRejected", "metElementColorSelected", "metFontFamily", "ID", "Modified", "Created", "AuthorId", "EditorId", "Attachments", "GUID")
            .expand('metProjectModel')
            .filter("metProjectModel/ID eq " + modelId)
            .get();
    }

    async GetDetailsItemsFromList(listName, selectItems, expandItems, filterParams): Promise<any> {
        if (DEBUG) {
            await new Promise(resolve => setTimeout(resolve, 1000));
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


   async GetListInformation(listName: string, modelId: string): Promise<any> {
        let selectedColumns: any = [];
        if (DEBUG) {
            await new Promise(resolve => setTimeout(resolve, 1000));           
              return MockData.projectDescription || [];
        }

        return this.web.getList(this.siteRelativeUrl + '/lists/' + listName)
            .items
            .select(selectedColumns.join())
            .filter("ID eq " + modelId)
            .get();
    }

}
export default GenericModelService;