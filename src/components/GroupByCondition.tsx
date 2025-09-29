import React, { useEffect } from 'react';
import { Button, Popover, Select } from 'antd';
import { type SelectOption } from "../types/uibase";
import { useLanguage } from '../contexts/LanguageContext';
import { type ButtonLabels } from '../types/i18n';
import { IconGroupBy,IconDelete } from '../icon/Icons';
import { MAX_GROUP_BY_LEVEL } from '../utils/CONSTANT';
import { CheckOutlined } from '@ant-design/icons';
import {EventService} from '../service/EventService';
import {EventName} from "../types/editableCell";

/**
 * 定义分组确认后抛出的事件数据
 */
export interface EventData_Group_OnSubmit{
  groupByColumns:{ column: string; sort: string }[];//获取到的数据
}

export interface GroupByConditionProps {
  columnsOptions: ()=>Promise<{ label: string; value: string }[]>;//一个回调函数，返回可选的分组字段列表

}

export interface ConditionSelectProps {
  columns: { label: string; value: string }[];
  onSubmit: (groupByColumns:{ column: string; sort: string }[]) => void;
  initialGroupByColumns?: { column: string; sort: string }[];//初始的分组条件
}

export interface OptionLabelProps {
  selectedValue: any;
  data: SelectOption[];
}

  // 自定义下拉选项渲染（带勾）
  const renderOption = (option: any, selectedValue: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      <span>{option.label}</span>
      {selectedValue === option.value && <CheckOutlined style={{ color: '#4caf50' }} />}
    </div>
  );

const Content: React.FC<ConditionSelectProps> = ({ columns,onSubmit,initialGroupByColumns }: ConditionSelectProps) => {
  const { t } = useLanguage();
  const labels: ButtonLabels = {
    group_AddMore: t('group_AddMore'),
    group_GroupBy: t('group_GroupBy'),
    group_asc: t('group_asc'),
    group_desc: t('group_desc'),
    group_submit: t('group_submit'),    
  };
  const sortOptions = [
    { label: labels.group_asc, value: 'asc' },
    { label: labels.group_desc, value: 'desc' },
  ];
  const [addMoreHovered, setAddMoreHovered] = React.useState(false);
  const [submitHovered, setSubmitHovered] = React.useState(false);
  const [groupByColumns, setGroupByColumns] = React.useState<{ column: string; sort: string }[]>([]);
  const [deleteButtonHovered, setDeleteButtonHovered] = React.useState<boolean[]>([]);

  useEffect(() => {    
    if(initialGroupByColumns && initialGroupByColumns.length > 0){
      setGroupByColumns(initialGroupByColumns);
      setDeleteButtonHovered(new Array(initialGroupByColumns.length).fill(false));
      return;
    }else{      
      setGroupByColumns([{ column: '', sort: 'asc' }]);
      setDeleteButtonHovered([false]);
      return;
    }
  }, [initialGroupByColumns]);

  const addMoreButtonStyle = {
    marginTop: '8px',
    color: '#4a4a4a',
    backgroundColor: addMoreHovered ? '#c6c6c6ff' : 'transparent',
    padding: 10,
    width:'80px',
    fontWeight: 500,
  };

  const submitButtonStyle = {
    marginTop: '8px',
    marginLeft:'8px',
    color: '#4a4a4a',    
    backgroundColor: submitHovered ? '#c6c6c6ff' : 'transparent',
    padding: 0,
    width:'40px',
    fontWeight: 500,
  };


  const deleteButtonStyle=(index:number):React.CSSProperties => {
    return {
      cursor: 'pointer',
      backgroundColor: (deleteButtonHovered && deleteButtonHovered.length>index && deleteButtonHovered[index])?'#f6a6a6ff':'transparent',
      border: 'none',
      outline: 'none',
      transition: 'all 0.3s ease',
      padding: 0,
      margin: 0,
    }
  };

  const removeGroupByColumn = (index: number) => {
    const newGroupByColumns = [...groupByColumns];
    newGroupByColumns.splice(index, 1);
    setGroupByColumns(newGroupByColumns);
    /**若所有分组都删除后，设置一个空分组，不允许所有分组在组件中上都删除 */
    if(newGroupByColumns.length === 0){
      setGroupByColumns([{ column: '', sort: 'asc' }]);
    }
    /**清除该分组对应“删除”按钮的hovered状态 */
    const newDeleteButtonHovered = [...deleteButtonHovered];
    newDeleteButtonHovered.splice(index, 1);
    setDeleteButtonHovered(newDeleteButtonHovered);
  }

  const addMore = () => {
    setGroupByColumns([...groupByColumns, { column: '', sort: 'asc' }])
    setDeleteButtonHovered([...deleteButtonHovered, false]);
  };

  const submit = () => {
    //可能用户只是点击了新分组，但是没有实际选择分组字段，所以清除了无用的元素再提交
    onSubmit(groupByColumns.filter(gbc=>gbc.column !== ''));
  }

  return (
    <div>
      <span>{labels.group_GroupBy}</span>

      {
          groupByColumns.map((item, index) => (
              <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', marginTop: '8px' }} key={index}>
                <Select
                  value={item.column}
                  // 使用fieldNames指定选中时显示originalLabel（不包含勾选标记）
                  // fieldNames={{ label: 'originalLabel' }}
                  options={
                    columns.filter((column)=>{
                        // 过滤掉已选择的列
                        return !groupByColumns.some(gbc=>gbc.column === column.value && gbc !== item);
                      }
                    ).map(col => ({ label: String(col.label), value: String(col.value) }))}
                  optionRender={(option) => renderOption(option, item.column)}
                  onChange={(value) => {
                    const newGroupByColumns = [...groupByColumns];
                    newGroupByColumns[index].column = value;
                    setGroupByColumns(newGroupByColumns);
                  }}
                  style={{ width: '200px' }}
                />
                <Select
                  value={item.sort}
                  options={sortOptions}
                  style={{ width: '200px' }}
                  defaultValue={'asc'}
                  // 仅在下拉选项中使用带勾的渲染方式
                  optionRender={(option) => renderOption(option, item.sort)}
                  onChange={(value) => {
                    const newGroupByColumns = [...groupByColumns];
                    newGroupByColumns[index].sort = value;
                    setGroupByColumns(newGroupByColumns);
                  }}
                />
              
                <Button icon={<IconDelete size={16} color={deleteButtonHovered ? '#9d1402ff' : '#f85a51ff'} /> }
                style={deleteButtonStyle(index)}
                onMouseEnter={() => setDeleteButtonHovered((pre)=>{const newArr = [...pre]; newArr[index] = true; return newArr;})}
                onMouseLeave={() => setDeleteButtonHovered((pre)=>{const newArr = [...pre]; newArr[index] = false; return newArr;})}
                onClick={()=>removeGroupByColumn(index)}>
                </Button>
              
              </div>
          )
        )
      }
      <div style={{display:'flex'}}>
      <Button
        type="text"
        style={addMoreButtonStyle}
        onMouseEnter={() => setAddMoreHovered(true)}
        onMouseLeave={() => setAddMoreHovered(false)}
        onClick={() => addMore()}
        disabled={groupByColumns.length >= MAX_GROUP_BY_LEVEL} /**超过“最大分组数量”，则增加按钮屏蔽掉 */
      >
        {labels.group_AddMore}
      </Button>
      <Button
        type="text"
        style={submitButtonStyle}
        onMouseEnter={() => setSubmitHovered(true)}
        onMouseLeave={() => setSubmitHovered(false)}
        onClick={() => submit()}        
      >
        {labels.group_submit}
      </Button>
      </div>
    </div>
  );
};

const App: React.FC<GroupByConditionProps> = ({ columnsOptions }) => {
  const { t } = useLanguage();
  const labels: ButtonLabels = {
    group_GroupByColumns: t('group_GroupByColumns'),
  };
  const [hovered, setHovered] = React.useState(false);
  const [columns, setColumns] = React.useState<{ label: string, value: string }[]>([]);
  const [open,setOpen] = React.useState(false);
  const [currentGroupByColumns,setCurrentGroupByColumns] = React.useState<{ column: string; sort: string }[]>([]);
  const [groupByColumns, setGroupByColumns] = React.useState<{ column: string; sort: string }[]>([]);


  const handleOpenChange=(isOpen:boolean):void=>{
    if(isOpen){
      //打开弹窗时，用上次确认保存的分组条件初始化
      setGroupByColumns([...currentGroupByColumns]);
    }else{
      //关闭弹窗时，恢复到上次保存的分组条件
      setGroupByColumns([...currentGroupByColumns]);
    }
    // setOpen(!open);
    setOpen(isOpen);
  }
  
  const handleSubmit=(groupByColumns:{ column: string; sort: string }[]):void=>{
    setOpen(false);
    //记录下当前的分组条件，以便后续在用户没有点击“确定”按钮而关闭弹窗进行恢复
    setCurrentGroupByColumns([...groupByColumns]);
    EventService.triggerEvent<EventData_Group_OnSubmit>(EventName.onGroupSubmit, {
          groupByColumns: groupByColumns,//获取到的数据
    });
  }
  useEffect(() => {
    const fetchColumns = async ()=>{
      const columns =  columnsOptions();
      setColumns(await columns);
    }
    fetchColumns();
  }, []);

  const buttonStyle: React.CSSProperties = {
    fontSize: 13,
    padding: '0px 8px',
    display: 'flex',
    fontWeight: 700,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: hovered ? '#d1b3ffff' : '#e8d2ffff',
    color: hovered ? '#8e4de1ff' : '#ac6bf1ff',
    border: 'none',
    outline: 'none',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  };
  if (columns === undefined || columns.length === 0) {
    return <></>;
  }  
  return (
    <Popover placement="bottom" destroyOnHidden={true} content={
      <Content
        columns={columns}
        onSubmit={handleSubmit}
        initialGroupByColumns={groupByColumns}//弹窗打开时初始化分组条件
      />} 
      trigger="click" open={open}
      onOpenChange={handleOpenChange}>
      <Button
        icon={<IconGroupBy size={16} color={hovered ? '#8a4af3' : '#ac6bf1'} />}
        style={buttonStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}  
      >
        {labels.group_GroupByColumns}
      </Button>
    </Popover>
  );
};

export default App;
