
import edit from '../../icons/edit.svg';

function List({headers, items, pagination, page, changePage}) {

    console.log(pagination)

    const renderCellActions = (head, item) =>{
        let icon = '';

        switch(head.icon){
            case 'edit':
                icon = edit;
            break;
        }
        
        switch(head.type){
            case 'button':
                if(icon != ''){
                    return <button onClick={ () => head.onclick(item)}><img width='20' src={icon}/> {head.text}</button>
                }else{
                    return <button>{head.text}</button>
                }
            break;
        }
    }

    return (
    <div className='list'>
        <div className='header-section'>
            {headers.map( head => 
                <div className='header' key={head.key}>
                    {head.name}
                </div>
            )}
        </div>
        <div className='body-section'>
            {items.map(item => 
                <div className='row' key={item.id}>
                    {headers.map(head => 
                        head.key != 'action' ? 
                            <div key={item.id+''+head.key} className='cell'>{item[head.key]}</div>
                        :
                            <div key={item.id+''+head.key} className='cell'>
                                {renderCellActions(head, item)}
                            </div>
                    )}
                </div>
            )}
        </div>
        <div className='pagination'>
            <div>
                {pagination.from} to {pagination.to} of {pagination.total}
            </div>
            <div className='buttons-pages'>
                <button onClick={() => changePage(null, 1)} >First</button>
                <button onClick={() => changePage(null, page-1)} >Previous</button> 
                {/* {[...Array(pagination.last_page)].map((_, i) => (
                    <button key={i}>{i + 1}</button>
                ))} */}
                <input type='number' step='1' value={page} 
                    onChange={changePage} onKeyDown={changePage}
                />
                <button onClick={() => changePage(null, page+1)} >Next</button>
                <button onClick={() => changePage(null, pagination.last_page)} >Last</button>
            </div>
        </div>
    </div>
    );
}
export default List;

