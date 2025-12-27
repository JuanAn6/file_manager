import { useEffect } from 'react';
import '../../styles/FileList.css';
import edit_icon from '../../icons/edit.svg'
import trash_icon from '../../icons/trash.svg'
import dots_icon from '../../icons/dots.svg'
import ActionMenu from '../custom/ActionMenu';
import { formatDateFromDatabse } from '../../utils/utils'

function FileList({items, goFolder}) {

  useEffect(()=>{
    // console.log(items);
  },[items])

  //New folder

  //Update name of item (Update in line)

  //Drop item

  //Right click menu

  return (
    <div>
      <button>New Folder</button>
      <table className='list'>
        <thead>
          <tr>
            <td className='td-check'><input type='checkbox'/></td>
            <th>Icon</th>
            <th className='th-name'>Name</th>
            <th>Owner</th>
            <th>Modified at</th>
            <th>Created at</th>
            <th>Size / Items</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => 
            <tr key={item.id} onDoubleClick={ () => goFolder(item.id) } >
              <td className='td-check'><input type='checkbox'/></td>
              <td className='td-icon'>📁</td>
              <td className='td-name'>{item.name}</td>
              <td className='td-owner'>{item.user.name}</td>
              <td className='td-date'>{formatDateFromDatabse(item.created_at)}</td>
              <td className='td-date'>{formatDateFromDatabse(item.updated_at)}</td>
              <td className='td-size'>{item.size}</td>
              <td className='td-actions'>
                <ActionMenu trigger={<button><img width='20' src={dots_icon}/></button>}>
                  <button><img width='20' src={edit_icon}/> Edit</button>
                  <button><img width='20' src={trash_icon}/> Delete</button>
                </ActionMenu>
              </td>
            </tr>
          )}    
        </tbody>
      </table>
    </div>
  );
}
export default FileList;