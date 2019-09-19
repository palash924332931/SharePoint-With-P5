import * as React from 'react';
import styles from './GenericModelGeneration.module.scss';
import * as strings from 'GenericModelGenerationWebPartStrings';
export default class DropDown extends React.Component<{ dropDownItems: any, parameters: any, itemType: string, fnRedirectParent: any, defaultSelectedElementId: any }> {
    public selectedItemId: any;
    constructor(props) {
        super(props);
    }

    public onChangeDropdown = (event) => {
        let selectedItemValue = event.target.value;
        let selectedItemText = event.nativeEvent.srcElement.text;
        this.props.dropDownItems.forEach(element => {
            if (element.Id == selectedItemValue) {
                selectedItemText = element.Title;
            }
        });
        //let selectedItemText = event.target.selectedOptions[0].text;
        //redirect to another page
        this.props.fnRedirectParent(this.props.itemType, selectedItemValue, selectedItemText);
    }

    public fnRedirectToItemSelectedPage(itemId: any) {
        if (itemId == "" || itemId == 0 || itemId == undefined) {
            return false;
        }
        let selectedItemText = "";
        this.props.dropDownItems.forEach(element => {
            if (element.Id == itemId) {
                selectedItemText = element.Title;
            }
        });       
        this.props.fnRedirectParent(this.props.itemType, itemId, selectedItemText);
    }

    public render(): React.ReactElement<{}> {
        let content = '';
        if (this.props.parameters['metElementId'] != "" && this.props.parameters['metSupportingProcess'] == "") { //if only element Item selected
            content = this.props.dropDownItems.map((item, key) => {
                if (this.props.itemType == 'elementItems') { //for elementItems
                    if (this.props.parameters['metElementId'] == item['Id']) {
                        this.selectedItemId = item['Id'];
                        return (<option value={item['Id']} selected key={key}>{item['Title']}</option>);
                    }
                    else {
                        return (<option value={item['Id']} key={key}>{item['Title']}</option>);
                    }
                }
                else if (this.props.itemType == 'processItems') { //for processItems
                    return (<option value={item['Id']} key={key}>{item['Title']}</option>);
                }

            });
        }


        else if (this.props.parameters['metElementId'] == "" && this.props.parameters['metSupportingProcess'] != "") { //if only processItems selected
            content = this.props.dropDownItems.map((item, key) => {
                if (this.props.itemType == 'elementItems') { //for elementItems
                    return (<option value={item['Id']} key={key}>{item['Title']}</option>);
                }
                else if (this.props.itemType == 'processItems') { //for processItems
                    if (this.props.parameters['metSupportingProcess'] == item['Title']) {
                        this.selectedItemId = item['Id'];
                        return (<option value={item['Id']} selected key={key}>{item['Title']}</option>);
                    }
                    else {
                        return (<option value={item['Id']} key={key}>{item['Title']}</option>);
                    }
                }

            });
        }


        else if (this.props.parameters['metElementId'] != "" && this.props.parameters['metSupportingProcess'] != "") { //if both elementItem & processItem selected
            content = this.props.dropDownItems.map((item, key) => {
                if (this.props.itemType == 'elementItems') { //for elementItems
                    if (this.props.parameters['metElementId'] == item['Id']) {
                        this.selectedItemId = item['Id'];
                        return (<option value={item['Id']} selected key={key}>{item['Title']}</option>);
                    }
                    else {
                        return (<option value={item['Id']} key={key}>{item['Title']}</option>);
                    }
                }
                else if (this.props.itemType == 'processItems') { //for processItems
                    if (this.props.parameters['metSupportingProcess'] == item['Title']) {
                        this.selectedItemId = item['Id'];
                        return (<option value={item['Id']} selected key={key}>{item['Title']}</option>);
                    }
                    else {
                        return (<option value={item['Id']} key={key}>{item['Title']}</option>);
                    }
                }

            });
        }

        else { //if there are no parameters/nothing selected
            if (this.props.itemType == 'elementItems') {
                content = this.props.dropDownItems.map((item, key) => {
                    if (this.props.defaultSelectedElementId == item['Id']) {
                        this.selectedItemId = item['Id'];
                        return (<option value={item['Id']} selected key={key}>{item['Title']}</option>);
                    } else {
                        return (<option value={item['Id']} key={key}>{item['Title']}</option>);
                    }
                });
            } else {
                content = this.props.dropDownItems.map((item, key) => {
                    return (<option value={item['Id']} key={key}>{item['Title']}</option>);
                });
            }
        }



        return (
            <div className="d-flex justify-content-center">
                <div className={styles["selectWrap"]} style={{ float: "left" }}>
                    <select onChange={this.onChangeDropdown} >
                        <option value="0">{strings.PleaseSelectTitle}</option>
                        {content}
                    </select>
                </div>
                <div className="button-wrap" style={{ float: "left", marginLeft: 3 }}>
                    <a href="#" onClick={(e) => this.fnRedirectToItemSelectedPage(this.selectedItemId)} role="button"><i className="fa fa-caret-right custom" style={{ fontSize: 50, color: "#0078d7" }}></i></a>
                </div>
            </div>









        );
    }
}