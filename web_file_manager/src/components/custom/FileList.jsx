import { useEffect } from 'react';
import Loading from './Loading';
import '../../styles/FileList.css';

function FileList({items}) {

  useEffect(()=>{
    console.log(items);
  })
  return (
    <div>
      <table class="list">
        <thead>
          <tr>
            <td><input type="checkbox"/></td>
            <th>Icon</th>
            <th>Name</th>
            <th>Owner</th>
            <th>Modified at</th>
            <th>Created at</th>
            <th>Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => 
            <tr key={item.id}>
              <td><input type="checkbox"/></td>
              <td>📁</td>
              <td>{item.name}</td>
              <td>{item.user.name}</td>
              <td>{item.created_at}</td>
              <td>{item.updated_at}</td>
              <td>{item.size}</td>
              <td>...</td>
            </tr>
          )}    
        </tbody>
      </table>
    </div>
  );
}
export default FileList;