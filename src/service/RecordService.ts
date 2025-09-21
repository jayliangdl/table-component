
import {type Product} from "../types/Product";
interface RecordData extends Product {
    isLocal?: boolean; // 本地标识        
}
const saveRecord = async (record: RecordData): Promise<string> => {
  const url = `${import.meta.env.VITE_SERVER_HOST}/api/record`;
  const { isLocal, ...contentWithoutIsLocal } = record;
  const requestBody = {
    id:record.id,
    content: contentWithoutIsLocal, // 使用排除了 isLocal 的对象
    record_type: '1',
    parent_id: '1',
    template_id: '1',
    creator:"admin",
    updater:"admin",
  };
  const response = await fetch(url,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  const result = await response.json();
  return result.success==="true"?result.id:"";
}



const deleteRecord = async (id?: string): Promise<boolean> => {
  if(!id) return false;
  const url = `${import.meta.env.VITE_SERVER_HOST}/api/record/${id}`;
  const response = await fetch(url, { method: 'DELETE' });
  const result = await response.json();
  return result.success==="true";
}

export {type RecordData,saveRecord,deleteRecord};