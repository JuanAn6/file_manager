function Loading({ label = 'Loading' }) {
  return (
    <div className='spinner-block' role='status' aria-live='polite'>
      <span className='spinner' />
      {label}
    </div>
  );
}

export default Loading;
