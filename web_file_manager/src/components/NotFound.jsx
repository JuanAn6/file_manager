import { Link } from 'react-router-dom';
import Icon from './custom/Icon';

function NotFound() {
  return (
    <div className='card'>
      <p className='kicker'>404</p>
      <h2>Page not found</h2>
      <hr className='hr' />
      <p>The page you asked for does not exist.</p>
      <Link className='btn btn-secondary' to='/'>
        <Icon name='home' size={16} /> Back to home
      </Link>
    </div>
  );
}

export default NotFound;
