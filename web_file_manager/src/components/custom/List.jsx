

function List({headers, items, pagination, page, changePage}) {

    console.log(pagination)

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
            {items.map(user => 
                <div className='row' key={user.id}>
                    {headers.map(head => 
                        <div key={user.id+''+head.key} className='cell'>{user[head.key]}</div>
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

