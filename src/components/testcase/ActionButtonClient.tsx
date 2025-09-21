import ActionButton from "../ActionButton";
const ActionButtonClient = () => {
    return (
            <ActionButton 
                id={1} 
                onSave={async (id) => console.log(`Save clicked for id: ${String(id)}`)} 
                onEdit={async (id) => console.log(`Edit clicked for id: ${String(id)}`)} 
                onCancel={async (id) => console.log(`Cancel clicked for id: ${String(id)}`)} 
                onDelete={async (id) => console.log(`Delete clicked for id: ${String(id)}`)} 
            />
    );
}
export default ActionButtonClient;