function onClick() {
  console.warn('click')
}

export function Button() {
  return (
    <div>
      <button
        onClick={onClick}
        type='button'
      >
        Click
      </button>
    </div>
  )
}
