import CustomSelect from "../baseComponent/CustomSelect";
import { categories } from '../../utils/mockData';
const TestCustomSelect: React.FC = () => {
    const staticSelectConfig = `
    {
        "optionsConfig": {
            "type": "static",
            "staticOptionsConfig": [
                { "label": "Option 1", "value": "option1" },
                { "label": "Option 2", "value": "option2" },
                { "label": "Option 3", "value": "option3" }
            ]
        },
        "allowClear": true
    }`;
    const dynamicSelectConfig = `
    {
        "optionsConfig": {
            "type": "dynamic",
            "dynamicOptionsConfig": {
                "url": "https://jsonplaceholder.typicode.com/posts",
                "method": "GET",
                "headers": {
                },
                "params": {},
                "labelFieldName": "title",
                "valueFieldName": "id"
            }
        },
        "allowClear": true
    }`;

    const tempSelectConfig = `
    {
        "optionsConfig": {
            "type": "dynamic",
            "dynamicOptionsConfig": {
                "url": "temp:category",
                "method": "GET",
                "headers": {
                },
                "params": {},
                "labelFieldName": "label",
                "valueFieldName": "value"
            }
        },
        "allowClear": true
    }`; 
    return (
        <div>
            <h3>Test Custom Select Component</h3>
            <CustomSelect columnName="staticSelect"
                config={JSON.parse(staticSelectConfig)}
                defaultValue="option2"
                disabled={false}
                readOnly={false}
                style={{ width: 200 }}
                placeholder="Please select an option"
                onValueChanged={(value)=>{console.log('Selected temp value:',value)}}
            />
            <CustomSelect columnName="dynamicSelect"
                config={JSON.parse(dynamicSelectConfig)}
                // defaultValue={1}
                disabled={false}
                readOnly={false}
                style={{ width: 400, marginTop: '20px' }}
                placeholder="Please select a dynamic option"
                onValueChanged={(value)=>{console.log('Selected temp value:',value)}}
            />
            <CustomSelect columnName="tempSelect"
                config={JSON.parse(tempSelectConfig)}
                defaultValue={categories[2]}
                disabled={false}
                readOnly={false}
                style={{ width: 200, marginTop: '20px' }}
                placeholder="Please select a temp option"
                onValueChanged={(value)=>{console.log('Selected temp value:',value)}}
            />

        </div>
    );
}
export default TestCustomSelect;